/* eslint-disable react/prop-types */
import { Alert, Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import BoltIcon from '@mui/icons-material/Bolt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { AUCTION_PHASE, parseAuctionDate } from '../../features/vehicles/auctionTime';
import {
  getBidAvailability,
  getBuyNowAvailability,
  getReserveStatus,
} from '../../features/vehicles/auctionActions';
import { formatDateTime, formatDuration, formatMoney } from '../../features/vehicles/vehicleFormat';

const ACTION_SX = { minHeight: 44, textTransform: 'none', fontWeight: 700 };

const PHASE_CHIP = {
  [AUCTION_PHASE.OPEN]: { label: 'Live auction', color: 'success' },
  [AUCTION_PHASE.OPEN_ENDED]: { label: 'Live, no end time', color: 'success' },
  [AUCTION_PHASE.UPCOMING]: { label: 'Upcoming', color: 'info' },
  [AUCTION_PHASE.CLOSED]: { label: 'Auction ended', color: 'default' },
  [AUCTION_PHASE.DATA_ERROR]: { label: 'Invalid auction dates', color: 'error' },
};

function timeSummary(vehicle, phase, now) {
  const start = parseAuctionDate(vehicle.auction_start);
  const end = parseAuctionDate(vehicle.auction_end);
  const nowMs = now.getTime();
  switch (phase) {
    case AUCTION_PHASE.UPCOMING:
      return { label: 'Starts in', value: formatDuration(start.getTime() - nowMs) };
    case AUCTION_PHASE.OPEN: {
      const remaining = end.getTime() - nowMs;
      return {
        label: 'Time left',
        value: formatDuration(remaining),
        urgent: remaining <= 60 * 60 * 1000,
      };
    }
    case AUCTION_PHASE.OPEN_ENDED:
      return { label: 'Time left', value: 'No end time' };
    case AUCTION_PHASE.CLOSED:
      return { label: 'Ended', value: formatDateTime(end) };
    default:
      return { label: 'Time left', value: 'Unavailable' };
  }
}

/** Result banner: winner, high bidder or how a closed auction finished. */
function Outcome({ vehicle, phase, userId }) {
  // Backend ids are integers; compare as strings so a serialized id still matches.
  const isWinner = userId != null && vehicle.current_winner_id != null
    && String(vehicle.current_winner_id) === String(userId);
  const hasBids = vehicle.bid_count > 0 && Number.isFinite(vehicle.current_bid);
  if (phase === AUCTION_PHASE.CLOSED) {
    if (isWinner) {
      return (
        <Alert severity="success" variant="filled">
          You won this vehicle for {formatMoney(vehicle.current_bid)} (final price).
        </Alert>
      );
    }
    return (
      <Alert severity="info">
        {hasBids
          ? `Auction ended. Final price ${formatMoney(vehicle.current_bid)}.`
          : 'Auction ended with no bids.'}
      </Alert>
    );
  }
  if (isWinner) {
    return <Alert severity="success">You are the high bidder.</Alert>;
  }
  return null;
}

const Stat = ({ label, value, emphasis = false, color }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontWeight: emphasis ? 800 : 600,
        fontSize: emphasis ? { xs: '1.25rem', sm: '1.5rem' } : '1rem',
        color,
        overflowWrap: 'break-word',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const ActionReason = ({ id, children }) => (
  <Typography id={id} variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
    {children}
  </Typography>
);

const AuctionPanel = ({ vehicle, phase, now, userId, onPlaceBid, onBuyNow }) => {
  const closed = phase === AUCTION_PHASE.CLOSED;
  const chip = PHASE_CHIP[phase] ?? PHASE_CHIP[AUCTION_PHASE.DATA_ERROR];
  const time = timeSummary(vehicle, phase, now);
  const reserve = getReserveStatus(vehicle);
  const bid = getBidAvailability(vehicle, phase);
  const buyNow = getBuyNowAvailability(vehicle, phase);
  const hasBids = vehicle.bid_count > 0 && Number.isFinite(vehicle.current_bid);
  const priceLabel = closed ? 'Final price' : hasBids ? 'High bid' : 'Opening bid';
  const priceValue = closed && !hasBids
    ? 'No sale'
    : formatMoney(hasBids ? vehicle.current_bid : vehicle.starting_bid);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }} aria-labelledby="auction-panel-title">
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography id="auction-panel-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
          Auction
        </Typography>
        <Chip label={chip.label} color={chip.color} size="small" sx={{ fontWeight: 700 }} />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        <Stat label={priceLabel} value={priceValue} emphasis />
        <Stat
          label={time.label}
          value={time.value}
          emphasis={phase === AUCTION_PHASE.OPEN || phase === AUCTION_PHASE.UPCOMING}
          color={time.urgent ? 'error.main' : undefined}
        />
        <Stat label="Bids" value={Number.isFinite(vehicle.bid_count) ? vehicle.bid_count : '—'} />
        <Stat label="Starting bid" value={formatMoney(vehicle.starting_bid)} />
        <Stat
          label="Reserve"
          value={Number.isFinite(vehicle.reserve_price)
            ? `${formatMoney(vehicle.reserve_price)} · ${reserve.met ? 'met' : 'not met'}`
            : 'No reserve'}
          color={reserve.met ? 'success.main' : 'warning.dark'}
        />
        <Stat label="Buy Now price" value={buyNow.offered ? formatMoney(vehicle.buy_now_price) : 'Not offered'} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Outcome vehicle={vehicle} phase={phase} userId={userId} />
      </Box>

      <Stack spacing={1.5}>
        <Box>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<GavelIcon />}
            disabled={!bid.available}
            onClick={onPlaceBid}
            aria-describedby={bid.reason ? 'place-bid-reason' : undefined}
            sx={ACTION_SX}
          >
            Place bid
          </Button>
          {bid.reason && <ActionReason id="place-bid-reason">{bid.reason}</ActionReason>}
        </Box>

        {buyNow.offered && (
          <Box>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<BoltIcon />}
              disabled={!buyNow.available}
              onClick={onBuyNow}
              aria-describedby="buy-now-reason"
              sx={ACTION_SX}
            >
              Buy now for {formatMoney(vehicle.buy_now_price)}
            </Button>
            <ActionReason id="buy-now-reason">
              {buyNow.available
                ? 'Ends the auction immediately. You win at the Buy Now price.'
                : buyNow.reason}
            </ActionReason>
          </Box>
        )}

        <Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FavoriteBorderIcon />}
            disabled
            aria-describedby="favorite-reason"
            sx={ACTION_SX}
          >
            Add to favorites
          </Button>
          <ActionReason id="favorite-reason">Favorites arrive in Phase 2.</ActionReason>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Box
        component="dl"
        sx={{
          m: 0,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 2,
          rowGap: 0.75,
          fontSize: '0.8125rem',
          '& dt': { color: 'text.secondary' },
          '& dd': { m: 0, textAlign: 'right', fontWeight: 600 },
        }}
      >
        <dt>Starts</dt>
        <dd>{formatDateTime(parseAuctionDate(vehicle.auction_start))}</dd>
        <dt>Ends</dt>
        <dd>
          {vehicle.auction_end ? formatDateTime(parseAuctionDate(vehicle.auction_end)) : 'No end time'}
        </dd>
      </Box>
    </Paper>
  );
};

export default AuctionPanel;
