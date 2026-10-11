import { describe, it, expect } from 'vitest';
import {
  parseAuctionDate,
  getAuctionPhase,
  compareByAuctionEnd,
  INVALID_DATE,
  AUCTION_PHASE,
  getAuctionEndSummary,
} from './auctionTime';

describe('parseAuctionDate', () => {
  it('returns null for null, undefined and empty strings', () => {
    expect(parseAuctionDate(null)).toBeNull();
    expect(parseAuctionDate(undefined)).toBeNull();
    expect(parseAuctionDate('')).toBeNull();
    expect(parseAuctionDate('   ')).toBeNull();
  });

  describe('getAuctionEndSummary', () => {
    const now = new Date('2026-10-10T12:00:00Z');
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;

    it.each([
      [1, 'Ends in <1 minute', 'error'],
      [minute - 1, 'Ends in <1 minute', 'error'],
      [minute, 'Ends in 1 minute', 'error'],
      [minute + 1, 'Ends in 2 minutes', 'error'],
      [hour - 1, 'Ends in 60 minutes', 'error'],
      [hour, 'Ends in 1 hour', 'error'],
      [hour + 1, 'Ends in 2 hours', 'warning'],
      [day, 'Ends in 24 hours', 'warning'],
      [day + 1, 'Ends in 2 days', 'default'],
      [3 * day, 'Ends in 3 days', 'default'],
    ])('formats %i milliseconds remaining without understating time', (remaining, label, color) => {
      const vehicle = { auction_end: new Date(Number(now) + remaining) };
      expect(getAuctionEndSummary(vehicle, now)).toEqual({ label, color });
      expect(getAuctionEndSummary(vehicle, Number(now))).toEqual({ label, color });
    });

    it('handles ended, open-ended and invalid auctions explicitly', () => {
      expect(getAuctionEndSummary({ auction_end: now }, now).label).toBe('Ended');
      expect(getAuctionEndSummary({ auction_end: null }, now).label).toBe('No end time');
      expect(getAuctionEndSummary({ auction_end: 'bad' }, now)).toEqual({
        label: 'Invalid auction date', color: 'error',
      });
    });

    it('does not apply urgency colors before bidding opens', () => {
      expect(getAuctionEndSummary({
        auction_start: new Date(Number(now) + minute),
        auction_end: new Date(Number(now) + hour),
      }, now)).toEqual({ label: 'Coming soon', color: 'default' });
    });

    it('shows Coming soon without an end time and switches at the exact start', () => {
      const vehicle = {
        auction_start: new Date(Number(now) + minute),
        auction_end: new Date(Number(now) + hour),
      };
      expect(getAuctionEndSummary({ ...vehicle, auction_end: null }, now).label).toBe('Coming soon');
      expect(getAuctionEndSummary(vehicle, vehicle.auction_start)).toEqual({
        label: 'Ends in 59 minutes', color: 'error',
      });
    });

    it('compares an explicit local offset to the same UTC instant', () => {
      expect(getAuctionEndSummary({ auction_end: '2026-10-10T07:30:00-05:00' }, now).label)
        .toBe('Ends in 30 minutes');
    });
  });

  it('treats offset-free ISO strings as UTC', () => {
    const date = parseAuctionDate('2026-10-18T11:03:17.983954');
    expect(date).toBeInstanceOf(Date);
    expect(date.toISOString()).toBe('2026-10-18T11:03:17.983Z');
  });

  it('treats space-separated SQLite datetimes as UTC', () => {
    const date = parseAuctionDate('2026-10-18 11:03:17');
    expect(date.toISOString()).toBe('2026-10-18T11:03:17.000Z');
  });

  it('respects explicit offsets instead of forcing UTC', () => {
    expect(parseAuctionDate('2026-10-18T11:00:00+02:00').toISOString()).toBe(
      '2026-10-18T09:00:00.000Z',
    );
    expect(parseAuctionDate('2026-10-18T11:00:00Z').toISOString()).toBe(
      '2026-10-18T11:00:00.000Z',
    );
  });

  it('accepts Date instances unchanged', () => {
    const input = new Date('2026-01-01T00:00:00Z');
    expect(parseAuctionDate(input)).toBe(input);
  });

  it('flags unparseable values as data errors', () => {
    expect(parseAuctionDate('not a date')).toBe(INVALID_DATE);
    expect(parseAuctionDate(new Date('junk'))).toBe(INVALID_DATE);
  });
});

describe('getAuctionPhase', () => {
  const now = new Date('2026-10-10T12:00:00Z');

  it('returns upcoming before the start', () => {
    const vehicle = {
      auction_start: '2026-10-11T00:00:00',
      auction_end: '2026-10-16T00:00:00',
    };
    expect(getAuctionPhase(vehicle, now)).toBe(AUCTION_PHASE.UPCOMING);
  });

  it('returns open between start and end', () => {
    const vehicle = {
      auction_start: '2026-10-05T00:00:00',
      auction_end: '2026-10-12T00:00:00',
    };
    expect(getAuctionPhase(vehicle, now)).toBe(AUCTION_PHASE.OPEN);
  });

  it('returns closed exactly at and after the end', () => {
    const vehicle = {
      auction_start: '2026-10-05T00:00:00',
      auction_end: '2026-10-10T12:00:00',
    };
    expect(getAuctionPhase(vehicle, now)).toBe(AUCTION_PHASE.CLOSED);
  });

  it('returns open-ended for started auctions with no end', () => {
    const vehicle = {
      auction_start: '2026-10-05T00:00:00',
      auction_end: null,
    };
    expect(getAuctionPhase(vehicle, now)).toBe(AUCTION_PHASE.OPEN_ENDED);
  });

  it('returns data-error for invalid dates instead of fabricating activity', () => {
    expect(
      getAuctionPhase({ auction_start: 'garbage', auction_end: null }, now),
    ).toBe(AUCTION_PHASE.DATA_ERROR);
    expect(
      getAuctionPhase({ auction_start: '2026-10-05T00:00:00', auction_end: '??' }, now),
    ).toBe(AUCTION_PHASE.DATA_ERROR);
  });
});

describe('compareByAuctionEnd', () => {
  it('orders finite ends ascending', () => {
    const later = { id: 'b', auction_end: '2026-10-20T00:00:00' };
    const sooner = { id: 'a', auction_end: '2026-10-12T00:00:00' };
    expect([later, sooner].sort(compareByAuctionEnd)).toEqual([sooner, later]);
  });

  it('places null ends last', () => {
    const openEnded = { id: 'z', auction_end: null };
    const timed = { id: 'a', auction_end: '2026-10-12T00:00:00' };
    expect([openEnded, timed].sort(compareByAuctionEnd)).toEqual([timed, openEnded]);
  });

  it('places invalid ends last', () => {
    const invalid = { id: 'z', auction_end: 'bogus' };
    const timed = { id: 'a', auction_end: '2026-10-12T00:00:00' };
    expect([invalid, timed].sort(compareByAuctionEnd)).toEqual([timed, invalid]);
  });

  it('tie-breaks equal ends by id for determinism', () => {
    const b = { id: 'b-id', auction_end: '2026-10-12T00:00:00' };
    const a = { id: 'a-id', auction_end: '2026-10-12T00:00:00' };
    expect([b, a].sort(compareByAuctionEnd)).toEqual([a, b]);
  });
});
