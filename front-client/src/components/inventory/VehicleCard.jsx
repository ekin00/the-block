/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AuctionEndChip from './AuctionEndChip';

// Touch- and keyboard-operable targets must be at least 44px.
const ACTION_SX = { minHeight: 44, minWidth: 44, textTransform: 'none' };

/**
 * Compact mobile vehicle card. Shares records and callbacks with
 * VehicleGrid; filtering and auction rules live outside both renderers.
 * Favorite/Compare render disabled with a reason until their phases wire
 * real callbacks.
 */
const VehicleCard = ({
  vehicle,
  now,
  onOpenDetails,
  isFavorite = false,
  isCompared = false,
  onToggleFavorite,
  onToggleCompare,
}) => {
  const bid = vehicle.current_bid ?? vehicle.starting_bid;
  const miles = vehicle.odometer_mi;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Stack
          direction="column"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trim: {vehicle.trim || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Number.isFinite(miles)
                ? `${miles.toLocaleString()} mi`
                : 'Mileage unavailable'}
            </Typography>
          </Box>
          <AuctionEndChip vehicle={vehicle} now={now ?? new Date()} />
        </Stack>
        <Typography
          variant="h6"
          sx={{
            mt: 1,
            fontWeight: 700,
            color: 'success.main',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {bid != null ? `$${bid.toLocaleString()}` : '—'}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          aria-label={`View details for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          onClick={() => onOpenDetails?.(vehicle)}
          sx={ACTION_SX}
        >
          Details
        </Button>
        <Tooltip
          title={
            onToggleFavorite
              ? isFavorite
                ? 'Remove favorite'
                : 'Add to favorites'
              : 'Favorites arrive in Phase 2'
          }
        >
          <span>
            <Button
              size="small"
              variant="outlined"
              disabled={!onToggleFavorite}
              onClick={() => onToggleFavorite(vehicle.id)}
              aria-label={isFavorite ? 'Remove favorite' : 'Add to favorites'}
              sx={{ ...ACTION_SX, color: isFavorite ? 'error.main' : undefined }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </Button>
          </span>
        </Tooltip>
        <Tooltip
          title={
            onToggleCompare
              ? isCompared
                ? 'Remove from comparison'
                : 'Add to comparison'
              : 'Compare arrives in Phase 3'
          }
        >
          <span>
            <Button
              size="small"
              variant="outlined"
              disabled={!onToggleCompare}
              onClick={() => onToggleCompare(vehicle.id)}
              aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              sx={ACTION_SX}
            >
              <CompareArrowsIcon />
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default VehicleCard;
