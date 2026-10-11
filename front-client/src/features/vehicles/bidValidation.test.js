import { describe, expect, it } from 'vitest';
import {
  MAX_BID,
  QUICK_INCREMENTS,
  describeBidMinimum,
  getBidMinimum,
  incrementedAmount,
  isStaleBidError,
  parseBidInput,
  validateBid,
} from './bidValidation';

const vehicle = {
  starting_bid: 10000,
  current_bid: 12000,
  bid_count: 3,
  reserve_price: 14000,
  buy_now_price: 20000,
};
const noBids = { ...vehicle, bid_count: 0 };

describe('bid minimums', () => {
  it('uses an inclusive starting bid before the first bid', () => {
    expect(getBidMinimum(noBids)).toEqual({ amount: 10000, inclusive: true });
    expect(describeBidMinimum(noBids)).toBe('Enter $10,000 (the starting bid) or more.');
    expect(validateBid('10000', noBids)).toEqual({ ok: true, amount: 10000 });
    expect(validateBid('9999.99', noBids)).toEqual({
      ok: false, error: 'Bid must be at least the starting bid.',
    });
  });

  it('requires more than the current bid when bids exist', () => {
    expect(getBidMinimum(vehicle)).toEqual({ amount: 12000, inclusive: false });
    expect(describeBidMinimum(vehicle)).toBe('Enter more than the current bid of $12,000.');
    expect(validateBid('12000', vehicle)).toEqual({
      ok: false, error: 'Bid must be higher than the current bid.',
    });
    expect(validateBid('12000.01', vehicle)).toEqual({ ok: true, amount: 12000.01 });
  });

  it('does not use the reserve as a minimum', () => {
    expect(validateBid('10000', noBids)).toEqual({ ok: true, amount: 10000 });
    expect(validateBid('12500', vehicle)).toEqual({ ok: true, amount: 12500 });
  });

  it.each(['20000', '20500'])('accepts an ordinary bid at or above Buy Now: %s', (raw) => {
    expect(validateBid(raw, vehicle)).toEqual({ ok: true, amount: Number(raw) });
  });

  it('omits minimum help when the price is unavailable', () => {
    expect(describeBidMinimum({ bid_count: 0 })).toBe('');
    expect(describeBidMinimum({ bid_count: 1, current_bid: NaN })).toBe('');
  });
});

describe('parseBidInput', () => {
  it.each([
    ['$12,500.50', 12500.5, 2],
    ['12,500', 12500, 0],
    ['  $12,500.50  ', 12500.5, 2],
    ['.50', 0.5, 2],
    ['12500.123', 12500.123, 3],
  ])('parses %s and preserves decimal precision', (raw, value, decimals) => {
    expect(parseBidInput(raw)).toEqual({ value, decimals });
  });

  it.each(['abc', '', '-1', '1e10', 'Infinity', null, undefined, '500,50', '1,25,000'])('rejects malformed input %s', (raw) => {
    expect(parseBidInput(raw)).toBeNull();
  });
});

describe('validateBid', () => {
  it.each(['$12,500.50', '12,500'])('accepts formatted input %s as a number', (raw) => {
    expect(validateBid(raw, vehicle)).toEqual({
      ok: true, amount: raw.includes('.') ? 12500.5 : 12500,
    });
  });

  it.each(['500,50', '12500,5', '1,25,000', '12,50.00'])('rejects decimal or misplaced commas: %s', (raw) => {
    expect(validateBid(raw, vehicle)).toEqual({
      ok: false, error: 'Use a period for cents, for example 12500.50.',
    });
  });

  it.each(['12500.123', '12500.000'])('rejects more than two decimals: %s', (raw) => {
    expect(validateBid(raw, vehicle)).toEqual({ ok: false, error: 'Use at most 2 decimal places.' });
  });

  it('rejects zero', () => {
    expect(validateBid(0, noBids)).toEqual({ ok: false, error: 'Bid must be greater than $0.' });
  });

  it.each([-1, 'abc', 'Infinity', '1e10'])('rejects invalid or non-finite input %s', (raw) => {
    expect(validateBid(raw, vehicle)).toEqual({
      ok: false, error: 'Enter a number, for example 12500 or 12500.50.',
    });
  });

  it.each(['', '   ', null, undefined])('requires an amount: %s', (raw) => {
    expect(validateBid(raw, vehicle)).toEqual({ ok: false, error: 'Enter a bid amount.' });
  });

  it('rejects 10^10 but accepts the largest two-decimal amount below it', () => {
    expect(MAX_BID).toBe(1e10);
    expect(validateBid(1e10, vehicle)).toEqual({
      ok: false, error: 'Bid must be less than $10,000,000,000.',
    });
    expect(validateBid('10000000000', vehicle).ok).toBe(false);
    expect(validateBid('9999999999.99', vehicle)).toEqual({ ok: true, amount: 9999999999.99 });
  });

  it('rejects a parsed amount that overflows to infinity', () => {
    expect(validateBid('9'.repeat(400), vehicle)).toEqual({
      ok: false, error: 'Enter a number, for example 12500 or 12500.50.',
    });
  });
});

describe('incrementedAmount', () => {
  it('offers the supported shortcuts based on the current or starting bid', () => {
    expect(QUICK_INCREMENTS).toEqual([250, 500, 1000]);
    for (const increment of QUICK_INCREMENTS) {
      expect(incrementedAmount(vehicle, increment)).toBe(String(12000 + increment));
      expect(incrementedAmount(noBids, increment)).toBe(String(10000 + increment));
    }
  });

  it.each([
    [{ ...vehicle, current_bid: 12000.01 }, 500, '12500.01'],
    [{ ...noBids, starting_bid: 10000.1 }, 0.2, '10000.30'],
    [{ ...vehicle, current_bid: 0.1 }, 0.2, '0.30'],
    [{ ...vehicle, current_bid: 12000.126 }, 500, '12500.13'],
  ])('rounds %j plus %s to cents', (record, increment, expected) => {
    expect(incrementedAmount(record, increment)).toBe(expected);
  });

  it('does not invent an amount when the applicable price is missing', () => {
    expect(incrementedAmount({ bid_count: 0 }, 500)).toBe('');
    expect(incrementedAmount({ bid_count: 1, current_bid: NaN }, 500)).toBe('');
  });
});

describe('isStaleBidError', () => {
  it.each([404, 422])('recognizes status %i regardless of the message', (status) => {
    expect(isStaleBidError(Object.assign(new Error('Server rejection.'), { status }))).toBe(true);
  });

  it.each([400, 401, 403, 409, 500, '422', undefined])('does not refetch for status %s', (status) => {
    expect(isStaleBidError(Object.assign(new Error('Network down'), { status }))).toBe(false);
  });

  it('handles missing errors', () => {
    expect(isStaleBidError(null)).toBe(false);
    expect(isStaleBidError(undefined)).toBe(false);
  });
});
