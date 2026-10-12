import { AUCTION_PHASE, parseAuctionDate } from './auctionTime';
import { formatDateTime, formatMoney } from './vehicleFormat';

/**
 * Buyer-facing action availability for the details page. The backend stays
 * authoritative; these rules only mirror it so disabled controls can show an
 * explicit reason instead of failing on click.
 */

const startLabel = (vehicle) => {
  const start = parseAuctionDate(vehicle?.auction_start);
  return start instanceof Date ? formatDateTime(start) : 'when the auction starts';
};

export function getBidAvailability(vehicle, phase) {
  switch (phase) {
    case AUCTION_PHASE.UPCOMING:
      return { available: false, reason: `Bidding opens ${startLabel(vehicle)}.` };
    case AUCTION_PHASE.CLOSED:
      return { available: false, reason: 'Auction has ended.' };
    case AUCTION_PHASE.DATA_ERROR:
      return { available: false, reason: 'Auction dates are invalid; bidding is unavailable.' };
    default:
      return { available: true, reason: null };
  }
}

/**
 * Buy Now ends the auction immediately: the buyer wins and the Buy Now price
 * becomes the winning bid (final price).
 */
export function getBuyNowAvailability(vehicle, phase) {
  const price = vehicle?.buy_now_price;
  if (!Number.isFinite(price)) {
    return { offered: false, available: false, reason: 'Auction only. No Buy Now price is offered.' };
  }
  if (phase === AUCTION_PHASE.UPCOMING) {
    return { offered: true, available: false, reason: `Buy Now opens ${startLabel(vehicle)}.` };
  }
  if (phase === AUCTION_PHASE.CLOSED) {
    return { offered: true, available: false, reason: 'Auction has ended.' };
  }
  if (phase === AUCTION_PHASE.DATA_ERROR) {
    return { offered: true, available: false, reason: 'Auction dates are invalid; Buy Now is unavailable.' };
  }
  if (Number.isFinite(vehicle?.current_bid) && vehicle.current_bid >= price) {
    return {
      offered: true,
      available: false,
      reason: `Bidding has reached the Buy Now price of ${formatMoney(price)}.`,
    };
  }
  return { offered: true, available: true, reason: null };
}

/** Reserve status from the live price; reserve is never a bid minimum. */
export function getReserveStatus(vehicle) {
  if (!Number.isFinite(vehicle?.reserve_price)) {
    return { label: 'No reserve', met: true };
  }
  const met = Number.isFinite(vehicle?.current_bid) && vehicle.current_bid >= vehicle.reserve_price;
  return { label: met ? 'Reserve met' : 'Reserve not met', met };
}
