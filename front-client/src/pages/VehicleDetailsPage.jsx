import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
// BTW: to add Tooltip for additional info + Link to condition report
import { Alert, Box, Button, IconButton, Skeleton, Snackbar, Stack, Typography, Tooltip, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useUser } from '../context/UserContext';
import { useVehicleCatalog } from '../context/VehicleCatalogContext';
import { useFavorites } from '../context/FavoritesContext';
import { getAuctionPhase } from '../features/vehicles/auctionTime';
import { useAuctionClockControls } from '../features/vehicles/useAuctionClock';
import { useVehicleDetails } from '../features/vehicles/useVehicleDetails';
import { formatMoney, vehicleTitle } from '../features/vehicles/vehicleFormat';
import VehicleGallery from '../components/vehicleDetails/VehicleGallery';
import VehicleSpecs from '../components/vehicleDetails/VehicleSpecs';
import ConditionReport from '../components/vehicleDetails/ConditionReport';
import AuctionPanel from '../components/vehicleDetails/AuctionPanel';
import BuyNowDialog from '../components/vehicleDetails/BuyNowDialog';
import BidDialog from '../components/vehicleDetails/BidDialog';
import { getBidAvailability } from '../features/vehicles/auctionActions';

// BTW update: xs stacks seps + condition -> auction -> gallery; becuase not real image any how, show data md+ keeps the auction
// panel in a sticky right column beside the content.
const LAYOUT_SX = {
  display: 'grid',
  gap: { xs: 2, md: 3 },
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 7fr) minmax(0, 5fr)' },
  gridTemplateAreas: {
    xs: '"specs" "condition" "auction" "gallery"',
    md: '"specs auction" "condition auction" "gallery auction"',
  },
  alignItems: 'start',
};

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // A direct load has no in-app history entry to return to.
  const canGoBack = location.key !== 'default';
  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => (canGoBack ? navigate(-1) : navigate('/inventory'))}
      sx={{ minHeight: 44, textTransform: 'none', mb: 1, ml: -1 }}
    >
      Back to inventory
    </Button>
  );
};

const LoadingState = () => (
  <Box aria-busy="true" aria-label="Loading vehicle">
    <Skeleton variant="text" width="60%" height={48} />
    <Box sx={{ ...LAYOUT_SX, mt: 2 }}>
      <Skeleton variant="rounded" height={280} sx={{ gridArea: 'specs' }} />
      <Skeleton variant="rounded" height={360} sx={{ gridArea: 'auction' }} />
      <Skeleton variant="rounded" height={360} sx={{ gridArea: 'gallery' }} />
    </Box>
  </Box>
);

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const { applyBidResult } = useVehicleCatalog();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { now, refreshNow } = useAuctionClockControls();
  const { vehicle, status, error, refreshing, retry } = useVehicleDetails(id);
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleToggleFavorite = async (vehicleId) => {
    const isFav = isFavorite(vehicleId);
    const result = await toggleFavorite(vehicleId);
    if (!result.success) {
      setNotice(result.error?.message || 'Could not update favorites.');
    } else {
      setNotice(isFav ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  if (status === 'loading') {
    return (
      <Box>
        <BackButton />
        <LoadingState />
      </Box>
    );
  }

  if (status === 'not-found') {
    return (
      <Box>
        <BackButton />
        <Alert severity="warning">
          Vehicle not found. It may have been removed or the link is incorrect.{' '}
          <RouterLink to="/inventory">Browse inventory</RouterLink>
        </Alert>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box>
        <BackButton />
        <Alert
          severity="error"
          action={<Button color="inherit" onClick={retry} sx={{ minHeight: 44 }}>Retry</Button>}
        >
          Could not load this vehicle. {error?.message}
        </Alert>
      </Box>
    );
  }

  const phase = getAuctionPhase(vehicle, now);
  const title = vehicleTitle(vehicle);
  //const location = [vehicle.city, vehicle.province].filter(Boolean).join(', ');
  const subtitle = [`VIN: ${vehicle.vin}`, `Grade ${vehicle.condition_grade}`, `Title status: ${vehicle.title_status}`]
    .filter(Boolean)
    .join(' · ');

  const handleBuyNowSuccess = (result) => {
    // The Buy Now price is the winning bid; the server closes the auction now.
    applyBidResult(vehicle.id, {
      current_bid: result.current_bid,
      bid_count: result.bid_count,
      current_winner_id: user?.id ?? vehicle.current_winner_id,
      auction_end: result.auction_end ?? vehicle.auction_end,
    });
    refreshNow();
    setBuyNowOpen(false);
    setNotice(`You won the ${title} for ${formatMoney(result.current_bid)}.`);
  };

  const bid = getBidAvailability(vehicle, phase);

  // Only a 201 lands here. Inventory reads the same catalog, so it updates
  // without a refetch.
  const handleBidSuccess = (result) => {
    applyBidResult(vehicle.id, {
      current_bid: result.current_bid,
      bid_count: result.bid_count,
      current_winner_id: user?.id ?? vehicle.current_winner_id,
    });
    refreshNow();
    setBidOpen(false);
    setNotice(
      `Bid accepted. You are the high bidder at ${formatMoney(result.current_bid)}.`
      + (result.reserve_met === false ? ' Reserve not met yet.' : ''),
    );
  };

  // A rejected bid (outbid, ended, removed) may mean the cache is stale.
  const handleBidStale = () => {
    refreshNow();
    retry();
  };

  return (
    <Box>
      <BackButton />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', sm: '2.125rem' }, flex: 1 }}>
          {title}
        </Typography>
        <Tooltip title={isFavorite(vehicle.id) ? 'Remove favorite' : 'Add to favorites'}>
          <IconButton
            onClick={() => handleToggleFavorite(vehicle.id)}
            aria-label={isFavorite(vehicle.id) ? 'Remove favorite' : 'Add to favorites'}
            sx={{
              color: isFavorite(vehicle.id) ? 'error.main' : 'text.secondary',
              border: '1px solid',
              borderColor: isFavorite(vehicle.id) ? 'error.light' : 'divider',
              borderRadius: 2,
              width: 44,
              height: 44,
            }}
          >
            {isFavorite(vehicle.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Tooltip
        interactive            // keeps the bubble open so it can be clicked
        arrow
        placement="bottom-start"
        enterTouchDelay={0}
        title={
          <Box sx={{ maxWidth: 360 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() =>
                document.getElementById('condition-report')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              sx={{ color: 'inherit', fontWeight: 700 }}
            >
              { /* BTW jump!   */}
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {vehicle.condition_report?.trim() || 'No condition report provided.'}
              </Typography>
              Jump to condition report ↓
            </Link>
          </Box>
        }
      >
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      </Tooltip>
      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={<Button color="inherit" onClick={retry} sx={{ minHeight: 44 }}>Retry</Button>}
        >
          Showing saved details; the latest auction state could not be loaded.
        </Alert>
      )}
      {refreshing && (
        <Typography variant="caption" color="text.secondary" role="status" sx={{ display: 'block', mb: 1 }}>
          Updating auction status…
        </Typography>
      )}

      <Box sx={LAYOUT_SX}>
        { /* BTW swap with vehiclesSpecs, since gallery are fake and boring - this is done in LAYOUT_SX  */}
        <Box sx={{ gridArea: 'gallery' }}>
          <VehicleGallery key={vehicle.id} vehicle={vehicle} />
        </Box>

        {/* sticky Auction panel on right*/}
        <Box sx={{ gridArea: 'auction', position: { md: 'sticky' }, top: { md: 88 } }}>
          <AuctionPanel
            vehicle={vehicle}
            phase={phase}
            now={now}
            userId={user?.id}
            isFavorite={isFavorite(vehicle.id)}
            onToggleFavorite={() => handleToggleFavorite(vehicle.id)}
            onPlaceBid={() => setBidOpen(true)}
            onBuyNow={() => setBuyNowOpen(true)}
          />
        </Box>
        <Box sx={{ gridArea: 'specs' }}>
          <VehicleSpecs vehicle={vehicle} />
        </Box>
        <Box id="condition-report" sx={{ gridArea: 'condition', scrollMarginTop: 88 }}>
          <ConditionReport vehicle={vehicle} />
        </Box>
        <Box sx={{ gridArea: 'condition' }}>
          <ConditionReport vehicle={vehicle} />
        </Box>

      </Box>

      <BidDialog
        key={`bid-${vehicle.id}`}
        open={bidOpen}
        vehicle={vehicle}
        canBid={bid.available}
        unavailableReason={bid.reason}
        onClose={() => setBidOpen(false)}
        onSuccess={handleBidSuccess}
        onStale={handleBidStale}
      />

      {Number.isFinite(vehicle.buy_now_price) && (
        <BuyNowDialog
          key={vehicle.id}
          open={buyNowOpen}
          vehicle={vehicle}
          onClose={() => setBuyNowOpen(false)}
          onSuccess={handleBuyNowSuccess}
        />
      )}

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setNotice(null)} sx={{ width: '100%' }}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VehicleDetailsPage;
