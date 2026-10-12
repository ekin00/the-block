import { api } from './api';

/**
 * Bid tracker access. Both calls send the current user via X-User-Id (added
 * by the API client). A bid makes the caller the high bidder; Buy Now ends
 * the auction immediately and the Buy Now price becomes the winning bid.
 */
export const placeBid = ({ theblockId, amount }, { signal } = {}) =>
  api.post('/api/bid-tracker', { theblock_id: theblockId, amount }, { signal });

export const buyNow = (theblockId, { signal } = {}) =>
  api.post('/api/bid-tracker/buy-now', { theblock_id: theblockId }, { signal });
