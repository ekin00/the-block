import {
  AUCTION_PHASE,
  compareByAuctionEnd,
  getAuctionPhase,
  parseAuctionDate,
  INVALID_DATE,
} from '../vehicles/auctionTime';
import { applyFilters, applySearch } from './inventoryFilters';

export const PAGE_SIZES = [5, 10, 25];

export const SORTABLE_FIELDS = [
  { field: 'year', label: 'Year' },
  { field: 'make', label: 'Make' },
  { field: 'model', label: 'Model' },
  { field: 'current_bid', label: 'Current bid' },
  { field: 'odometer_mi', label: 'Mileage' },
  { field: 'trim', label: 'Trim' },
  { field: 'auction_end', label: 'Time left' },
];

const SORTABLE_FIELD_NAMES = new Set(SORTABLE_FIELDS.map(({ field }) => field));

function compareIds(a, b) {
  return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
}

function compareValues(a, b, field) {
  if (field === 'auction_end') {
    const dateA = parseAuctionDate(a?.auction_end);
    const dateB = parseAuctionDate(b?.auction_end);
    const msA = dateA instanceof Date ? dateA.getTime() : null;
    const msB = dateB instanceof Date ? dateB.getTime() : null;
    if (msA === null && msB === null) {
      return compareIds(a, b);
    }
    if (msA === null) {
      return 1;
    }
    if (msB === null) {
      return -1;
    }
    return msA - msB || compareIds(a, b);
  }

  const valueA = a?.[field];
  const valueB = b?.[field];
  if (valueA == null && valueB == null) {
    return compareIds(a, b);
  }
  if (valueA == null) {
    return 1;
  }
  if (valueB == null) {
    return -1;
  }

  const numericA = Number(valueA);
  const numericB = Number(valueB);
  const bothNumeric =
    String(valueA).trim() !== '' &&
    String(valueB).trim() !== '' &&
    Number.isFinite(numericA) &&
    Number.isFinite(numericB);
  const compared = bothNumeric
    ? numericA - numericB
    : String(valueA).localeCompare(String(valueB), undefined, {
        sensitivity: 'base',
        numeric: true,
      });
  return compared;
}

function getSort(sortModel) {
  const first = Array.isArray(sortModel) ? sortModel[0] : null;
  if (
    !first ||
    !SORTABLE_FIELD_NAMES.has(first.field) ||
    (first.sort !== 'asc' && first.sort !== 'desc')
  ) {
    return null;
  }
  return first;
}

function getInvalidFields(record) {
  const fields = [];
  if (parseAuctionDate(record?.auction_start) === INVALID_DATE) {
    fields.push('auction_start');
  }
  if (parseAuctionDate(record?.auction_end) === INVALID_DATE) {
    fields.push('auction_end');
  }
  return fields;
}

/**
 * Split fetched records into the active inventory (unexpired, valid dates)
 * and data-error rows. Closed auctions are dropped here, so every later
 * step (search, filters, options, counts) only ever sees active rows.
 */
export function partitionInventory(records, now) {
  const source = Array.isArray(records) ? records : [];
  const dataErrors = [];
  const activeRows = [];

  for (const record of source) {
    const phase = getAuctionPhase(record, now);
    if (phase === AUCTION_PHASE.DATA_ERROR) {
      dataErrors.push({
        id: record?.id == null ? null : String(record.id),
        fields: getInvalidFields(record),
        record,
        auctionPhase: phase,
      });
      continue;
    }
    if (phase === AUCTION_PHASE.CLOSED) {
      continue;
    }
    activeRows.push({ ...record, auctionPhase: phase });
  }
  return { activeRows, dataErrors };
}

/**
 * Search, filter, order and slice the active inventory. The URL-facing page
 * is converted to zero-based form by the view-state hook before this runs.
 */
export function orderInventory(
  activeRows,
  {
    query = '',
    filters = null,
    sortModel = [],
    paginationModel = { page: 0, pageSize: 25 },
  } = {},
) {
  const filteredRows = applyFilters(applySearch(activeRows, query), filters);
  const selectedSort = getSort(sortModel);
  const orderedRows = [...filteredRows].sort((a, b) => {
    if (!selectedSort) {
      return compareByAuctionEnd(a, b);
    }
    if (selectedSort.field === 'auction_end') {
      const dateA = parseAuctionDate(a?.auction_end);
      const dateB = parseAuctionDate(b?.auction_end);
      const msA = dateA instanceof Date ? dateA.getTime() : null;
      const msB = dateB instanceof Date ? dateB.getTime() : null;
      if (msA === null && msB !== null) {
        return 1;
      }
      if (msB === null && msA !== null) {
        return -1;
      }
      if (msA === null && msB === null) {
        return compareIds(a, b);
      }
      return (msA - msB) * (selectedSort.sort === 'desc' ? -1 : 1) ||
        compareIds(a, b);
    }
    const compared = compareValues(a, b, selectedSort.field);
    return (
      (selectedSort.sort === 'desc' ? -compared : compared) ||
      compareIds(a, b)
    );
  });

  const pageSize = PAGE_SIZES.includes(paginationModel?.pageSize)
    ? paginationModel.pageSize
    : 25;
  const page = Number.isInteger(paginationModel?.page) && paginationModel.page >= 0
    ? paginationModel.page
    : 0;
  const normalizedPaginationModel = { page, pageSize };
  const startIndex = page * pageSize;

  return {
    orderedRows,
    pageRows: orderedRows.slice(startIndex, startIndex + pageSize),
    rowCount: orderedRows.length,
    paginationModel: normalizedPaginationModel,
  };
}

/** Active inventory plus one ordered page, from raw records and the clock. */
export function deriveInventory(records, now, view = {}) {
  const { activeRows, dataErrors } = partitionInventory(records, now);
  return {
    activeRows,
    ...orderInventory(activeRows, view),
    dataErrors,
  };
}
