/* eslint-disable react/prop-types */
import { Chip, Tooltip } from '@mui/material';
import {
  AUCTION_PHASE,
  getAuctionEndSummary,
  getAuctionPhase,
  parseAuctionDate,
} from '../../features/vehicles/auctionTime';

const AuctionEndChip = ({ vehicle, now }) => {
  const { label, color } = getAuctionEndSummary(vehicle, now);
  const upcoming = getAuctionPhase(vehicle, now) === AUCTION_PHASE.UPCOMING;
  const end = parseAuctionDate(vehicle.auction_end);
  /* BTW bid count is more helpuful then date */
  const bidCount = vehicle.bid_count;
  const start = parseAuctionDate(vehicle.auction_start);
  const title = upcoming && start instanceof Date
    ? `Starts ${start.toLocaleString()}`
    : end instanceof Date ? ` ${bidCount.toLocaleString()} bids` : label;

  return (
    <Tooltip title={title} describeChild arrow>
      <Chip label={label} size="small" color={color} variant={color === 'default' ? 'outlined' : 'filled'} />
    </Tooltip>
  );
};

export default AuctionEndChip;
