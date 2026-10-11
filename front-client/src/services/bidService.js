import { api } from './api';

/**
 * Bid tracker access. Buy Now ends the auction immediately: the caller wins
 * and the Buy Now price becomes the winning bid. `placeBid` arrives in 1e.
 */
export const buyNow = (theblockId, { signal } = {}) =>
  api.post('/api/bid-tracker/buy-now', { theblock_id: theblockId }, { signal });
