import { formatMoney } from './vehicleFormat';

/**
 * Client-side bid rules that mirror POST /api/bid-tracker exactly. The
 * backend stays authoritative; this only prevents requests it would reject.
 * Reserve and Buy Now prices are never minimums: a bid at or above the Buy
 * Now price is an ordinary bid and the auction continues.
 */

// Numeric(12, 2) on the backend: amounts must stay below 10^10.
export const MAX_BID = 10_000_000_000;

export const QUICK_INCREMENTS = [250, 500, 1000];

const AMOUNT_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)$/;

// Commas are accepted only as thousands separators ("12,500.50"). Anything
// else, such as a decimal comma ("500,50"), is rejected rather than guessed.
const GROUPED_PATTERN = /^\d{1,3}(?:,\d{3})+(?:\.\d*)?$/;

const stripDollar = (raw) => String(raw ?? '').trim().replace(/^\$/, '').trim();

const hasBids = (vehicle) => Number(vehicle?.bid_count) > 0 && Number.isFinite(vehicle?.current_bid);

/** The lowest acceptable amount and whether it is inclusive. */
export function getBidMinimum(vehicle) {
  if (hasBids(vehicle)) {
    return { amount: vehicle.current_bid, inclusive: false };
  }
  return { amount: vehicle?.starting_bid, inclusive: true };
}

export function describeBidMinimum(vehicle) {
  const { amount, inclusive } = getBidMinimum(vehicle);
  if (!Number.isFinite(amount)) {
    return '';
  }
  return inclusive
    ? `Enter ${formatMoney(amount)} (the starting bid) or more.`
    : `Enter more than the current bid of ${formatMoney(amount)}.`;
}

/** Parses free text such as "$12,500.50" into a number, or null if malformed. */
export function parseBidInput(raw) {
  let text = stripDollar(raw);
  if (text.includes(',')) {
    if (!GROUPED_PATTERN.test(text)) {
      return null;
    }
    text = text.replace(/,/g, '');
  }
  if (!AMOUNT_PATTERN.test(text)) {
    return null;
  }
  return { value: Number(text), decimals: text.includes('.') ? text.split('.')[1].length : 0 };
}

/**
 * @returns {{ ok: true, amount: number } | { ok: false, error: string }}
 */
export function validateBid(raw, vehicle) {
  if (String(raw ?? '').trim() === '') {
    return { ok: false, error: 'Enter a bid amount.' };
  }
  const parsed = parseBidInput(raw);
  if (!parsed && stripDollar(raw).includes(',')) {
    return { ok: false, error: 'Use a period for cents, for example 12500.50.' };
  }
  if (!parsed || !Number.isFinite(parsed.value)) {
    return { ok: false, error: 'Enter a number, for example 12500 or 12500.50.' };
  }
  if (parsed.decimals > 2) {
    return { ok: false, error: 'Use at most 2 decimal places.' };
  }
  const amount = parsed.value;
  if (amount <= 0) {
    return { ok: false, error: 'Bid must be greater than $0.' };
  }
  if (amount >= MAX_BID) {
    return { ok: false, error: `Bid must be less than ${formatMoney(MAX_BID)}.` };
  }
  const minimum = getBidMinimum(vehicle);
  if (Number.isFinite(minimum.amount)) {
    if (minimum.inclusive && amount < minimum.amount) {
      return { ok: false, error: 'Bid must be at least the starting bid.' };
    }
    if (!minimum.inclusive && amount <= minimum.amount) {
      return { ok: false, error: 'Bid must be higher than the current bid.' };
    }
  }
  return { ok: true, amount };
}

/** Quick-increment target: a convenience on top of the live price, not a rule. */
export function incrementedAmount(vehicle, increment) {
  const base = hasBids(vehicle) ? vehicle.current_bid : vehicle?.starting_bid;
  if (!Number.isFinite(base)) {
    return '';
  }
  const cents = Math.round((base + increment) * 100);
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

/**
 * A 404 or 422 means the cached vehicle may be out of date (outbid, ended,
 * removed), so the page refetches server truth while keeping the message.
 */
export const isStaleBidError = (error) => error?.status === 404 || error?.status === 422;
