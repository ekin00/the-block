/**
 * Auction time policy.
 *
 * The backend serializes datetimes without a timezone offset (SQLite naive
 * datetimes) and those values mean UTC. Offset-free strings are therefore
 * interpreted as UTC; strings carrying an explicit offset (`Z` or `±hh:mm`)
 * are respected as-is.
 */

// Sentinel returned for unparseable input so callers can surface a data
// error instead of fabricating an active auction.
export const INVALID_DATE = Symbol('invalid-date');

export const AUCTION_PHASE = {
  UPCOMING: 'upcoming',
  OPEN: 'open',
  CLOSED: 'closed',
  OPEN_ENDED: 'open-ended',
  DATA_ERROR: 'data-error',
};

const OFFSET_PATTERN = /([zZ]|[+-]\d{2}:?\d{2})$/;

export function parseAuctionDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? INVALID_DATE : value;
  }
  const raw = String(value).trim();
  if (!raw) {
    return null;
  }
  // Accept both `2026-10-18T11:03:17` and SQLite's `2026-10-18 11:03:17`.
  const withT = raw.replace(' ', 'T');
  const normalized = OFFSET_PATTERN.test(withT) ? withT : `${withT}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? INVALID_DATE : date;
}

/**
 * @returns {'upcoming' | 'open' | 'closed' | 'open-ended' | 'data-error'}
 */
export function getAuctionPhase(vehicle, now) {
  const start = parseAuctionDate(vehicle?.auction_start);
  const end = parseAuctionDate(vehicle?.auction_end);
  if (start === INVALID_DATE || end === INVALID_DATE) {
    return AUCTION_PHASE.DATA_ERROR;
  }
  const nowMs = now instanceof Date ? now.getTime() : Number(now);
  if (start && nowMs < start.getTime()) {
    return AUCTION_PHASE.UPCOMING;
  }
  if (end === null) {
    // The backend permits auctions with no end time.
    return AUCTION_PHASE.OPEN_ENDED;
  }
  if (nowMs >= end.getTime()) {
    return AUCTION_PHASE.CLOSED;
  }
  return AUCTION_PHASE.OPEN;
}

const toEndMs = (vehicle) => {
  const end = parseAuctionDate(vehicle?.auction_end);
  return end instanceof Date ? end.getTime() : null;
};

export function getAuctionEndSummary(vehicle, now) {
  const phase = getAuctionPhase(vehicle, now);
  if (phase === AUCTION_PHASE.DATA_ERROR) {
    return { label: 'Invalid auction date', color: 'error' };
  }
  if (phase === AUCTION_PHASE.UPCOMING) {
    return { label: 'Coming soon', color: 'default' };
  }
  if (phase === AUCTION_PHASE.CLOSED) {
    return { label: 'Ended', color: 'default' };
  }
  const end = parseAuctionDate(vehicle?.auction_end);
  if (!end) {
    return { label: 'No end time', color: 'default' };
  }
  const remaining = end.getTime() - Number(now);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  let label;
  if (remaining < minute) {
    label = 'Ends in <1 min';
  } else if (remaining < hour) {
    label = `Ends in ${Math.min(59, Math.ceil(remaining / minute))} min`;
  } else {
    const [unit, duration] = remaining <= day ? ['hour', hour] : ['day', day];
    const count = Math.ceil(remaining / duration);
    label = `Ends in ${count} ${unit}${count === 1 ? '' : 's'}`;
  }
  return {
    label,
    color: remaining <= hour ? 'error' : remaining <= day ? 'warning' : 'default',
  };
}

const compareById = (a, b) =>
  String(a?.id ?? '').localeCompare(String(b?.id ?? ''));

/**
 * Default inventory ordering: soonest finite end first, no-end (and
 * invalid-date) rows last, UUID tie-break for determinism.
 */
export function compareByAuctionEnd(a, b) {
  const msA = toEndMs(a);
  const msB = toEndMs(b);
  if (msA === null && msB === null) {
    return compareById(a, b);
  }
  if (msA === null) {
    return 1;
  }
  if (msB === null) {
    return -1;
  }
  if (msA !== msB) {
    return msA - msB;
  }
  return compareById(a, b);
}
