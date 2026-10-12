import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  orderInventory,
  partitionInventory,
  PAGE_SIZES,
  SORTABLE_FIELDS,
} from './inventoryView';
import {
  CONDITION_BUCKETS,
  countActiveFilters,
  createDefaultFilters,
  deriveFilterOptions,
  intersectFiltersWithOptions,
  LIST_FILTER_KEYS,
  ODOMETER_MAX,
  ODOMETER_MIN,
  pruneModelsForMakes,
} from './inventoryFilters';

export const INVENTORY_PATH = '/inventory';

const SORTABLE_FIELD_NAMES = new Set(SORTABLE_FIELDS.map(({ field }) => field));
const CONDITION_VALUES = new Set(CONDITION_BUCKETS.map(({ value }) => value));
const DEFAULT_DESKTOP_PAGE_SIZE = 25;
const DEFAULT_MOBILE_PAGE_SIZE = 10;
const MAX_QUERY_LENGTH = 200;
const MAX_FILTER_VALUE_LENGTH = 100;
const MAX_FILTER_VALUES = 50;
const YEAR_PATTERN = /^\d{4}$/;
const ODOMETER_PATTERN = /^(\d{1,7})-(\d{1,7})$/;

function normalizeQuery(value) {
  return String(value ?? '').trim().slice(0, MAX_QUERY_LENGTH);
}

function sanitizeListValue(key, value) {
  if (key === 'year') {
    const text = String(value ?? '').trim();
    return YEAR_PATTERN.test(text) ? Number(text) : null;
  }
  if (key === 'condition') {
    const text = String(value ?? '').trim();
    return CONDITION_VALUES.has(text) ? text : null;
  }
  const text = String(value ?? '').trim();
  return text && text.length <= MAX_FILTER_VALUE_LENGTH ? text : null;
}

function sanitizeList(key, values) {
  const seen = new Set();
  const result = [];
  for (const value of Array.isArray(values) ? values : []) {
    const clean = sanitizeListValue(key, value);
    const dedupeKey = typeof clean === 'string' ? clean.toLocaleLowerCase() : clean;
    if (clean === null || seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    result.push(clean);
    if (result.length >= MAX_FILTER_VALUES) {
      break;
    }
  }
  return result;
}

function clampMiles(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }
  return Math.min(ODOMETER_MAX, Math.max(ODOMETER_MIN, Math.round(number)));
}

function sanitizeOdometer(value) {
  if (!Array.isArray(value) || value.length !== 2) {
    return [ODOMETER_MIN, ODOMETER_MAX];
  }
  const min = clampMiles(value[0]);
  const max = clampMiles(value[1]);
  if (min === null || max === null) {
    return [ODOMETER_MIN, ODOMETER_MAX];
  }
  return min <= max ? [min, max] : [max, min];
}

function parseOdometer(value) {
  const match = ODOMETER_PATTERN.exec(value ?? '');
  return match ? sanitizeOdometer([match[1], match[2]]) : [ODOMETER_MIN, ODOMETER_MAX];
}

function sanitizeFilters(filters) {
  const next = createDefaultFilters();
  for (const key of LIST_FILTER_KEYS) {
    next[key] = sanitizeList(key, filters?.[key]);
  }
  next.odometer = sanitizeOdometer(filters?.odometer);
  return next;
}

function parseFilters(searchParams) {
  const next = createDefaultFilters();
  for (const key of LIST_FILTER_KEYS) {
    next[key] = sanitizeList(key, searchParams.getAll(key));
  }
  next.odometer = parseOdometer(searchParams.get('odo'));
  return next;
}

function parsePage(value) {
  if (!/^\d+$/.test(value ?? '')) {
    return 1;
  }
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

function parsePageSize(value) {
  const size = Number(value);
  return PAGE_SIZES.includes(size) ? size : null;
}

function parseSort(value) {
  const [field, direction, ...extra] = String(value ?? '').split(':');
  if (
    extra.length ||
    !SORTABLE_FIELD_NAMES.has(field) ||
    (direction !== 'asc' && direction !== 'desc')
  ) {
    return [];
  }
  return [{ field, sort: direction }];
}

function parseView(searchParams, defaultPageSize) {
  const query = normalizeQuery(searchParams.get('q'));
  const filters = parseFilters(searchParams);
  const sortModel = parseSort(searchParams.get('sort'));
  const page = parsePage(searchParams.get('page')) - 1;
  const pageSize = parsePageSize(searchParams.get('size')) ?? defaultPageSize;
  return {
    query,
    filters,
    sortModel,
    paginationModel: { page, pageSize },
  };
}

function serializeView({ query, filters, sortModel, paginationModel }) {
  const next = new URLSearchParams();
  if (query) {
    next.set('q', query);
  }
  for (const key of LIST_FILTER_KEYS) {
    // Repeated keys, never comma-joined: values may contain commas.
    for (const value of filters?.[key] ?? []) {
      next.append(key, String(value));
    }
  }
  const [minOdo, maxOdo] = filters?.odometer ?? [ODOMETER_MIN, ODOMETER_MAX];
  if (minOdo > ODOMETER_MIN || maxOdo < ODOMETER_MAX) {
    next.set('odo', `${minOdo}-${maxOdo}`);
  }
  const [sort] = sortModel;
  if (sort) {
    next.set('sort', `${sort.field}:${sort.sort}`);
  }
  if (paginationModel.page > 0) {
    next.set('page', String(paginationModel.page + 1));
  }
  // Page size must be explicit after a state write: the default depends on
  // the viewport at the first mount and must survive resize and Back.
  next.set('size', String(paginationModel.pageSize));
  return next;
}

function clampPage(page, pageSize, rowCount, ready) {
  if (!ready) {
    return page;
  }
  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
  return Math.min(page, pageCount - 1);
}

/**
 * URL-backed inventory state and derived page data.
 *
 * When the inventory URL has no valid `size`, the default for the current
 * viewport (mobile 10, desktop 25) is written once with a replace, so later
 * resizes, details/Back and refresh keep it. A bare `/inventory` link
 * therefore resets to the current viewport default. Records and the clock are
 * passed in so counts and page clamping stay inside the hook.
 */
export function useInventoryView({
  isMobile,
  records,
  now,
  ready,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const viewportPageSize = isMobile
    ? DEFAULT_MOBILE_PAGE_SIZE
    : DEFAULT_DESKTOP_PAGE_SIZE;
  const hasValidSize = parsePageSize(searchParams.get('size')) !== null;

  const parsedView = useMemo(
    () => parseView(searchParams, viewportPageSize),
    [searchParams, viewportPageSize],
  );

  // MUI DataGrid re-applies the `sortModel` prop whenever its reference
  // changes and answers that "change" by jumping back to the first page.
  // parseView builds a fresh array for every URL change (even `page=`), so
  // memoize the model on the raw `sort` param to keep the reference stable.
  const sortParam = searchParams.get('sort');
  const sortModel = useMemo(() => parseSort(sortParam), [sortParam]);

  // Normalize only on the inventory route itself, so a write can never attach
  // `?size=` to another route after departure.
  useEffect(() => {
    if (pathname !== INVENTORY_PATH || hasValidSize) {
      return;
    }
    setSearchParams(
      (current) => serializeView(parseView(current, viewportPageSize)),
      { replace: true },
    );
  }, [pathname, hasValidSize, viewportPageSize, setSearchParams]);

  const { activeRows, dataErrors } = useMemo(
    () => partitionInventory(records, now),
    [records, now],
  );
  const baseOptions = useMemo(
    () => deriveFilterOptions(activeRows),
    [activeRows],
  );

  // Effective filters drop values the active inventory no longer offers, so a
  // stale shared link cannot leave a hidden filter. Skipped while loading,
  // when the options are still empty.
  const filters = useMemo(
    () =>
      ready
        ? intersectFiltersWithOptions(
            parsedView.filters,
            baseOptions.options,
            baseOptions.modelsByMake,
          )
        : parsedView.filters,
    [ready, parsedView.filters, baseOptions],
  );

  const filterOptions = useMemo(
    () =>
      filters.make.length
        ? {
            ...baseOptions.options,
            model: deriveFilterOptions(activeRows, {
              selectedMakes: filters.make,
            }).options.model,
          }
        : baseOptions.options,
    [activeRows, baseOptions, filters.make],
  );

  const derived = useMemo(
    () =>
      orderInventory(activeRows, {
        query: parsedView.query,
        filters,
        sortModel: parsedView.sortModel,
        paginationModel: parsedView.paginationModel,
      }),
    [activeRows, filters, parsedView],
  );

  const page = clampPage(
    parsedView.paginationModel.page,
    parsedView.paginationModel.pageSize,
    derived.rowCount,
    ready,
  );
  const paginationModel = {
    ...parsedView.paginationModel,
    page,
  };
  const pageStart = page * paginationModel.pageSize;
  const pageRows = derived.orderedRows.slice(
    pageStart,
    pageStart + paginationModel.pageSize,
  );
  const latestViewRef = useRef(null);
  latestViewRef.current = {
    parsedView,
    filters,
    modelsByMake: baseOptions.modelsByMake,
    paginationModel,
    derived,
    ready,
  };

  /**
   * The only writer. Merges the patch into the latest effective state and
   * calls setSearchParams once. `patch.filters` is a partial filter object;
   * any query, filter, sort or page-size change returns to page 1.
   */
  const update = useCallback(
    (patch = {}) => {
      const latestView = latestViewRef.current;
      const has = (key) => Object.prototype.hasOwnProperty.call(patch, key);
      const queryWasPatched = has('query');
      const sortWasPatched = has('sortModel');
      const paginationWasPatched = has('paginationModel');
      const filtersWerePatched = has('filters') && patch.filters != null;
      const nextQuery = queryWasPatched
        ? normalizeQuery(patch.query)
        : latestView.parsedView.query;
      let nextFilters = latestView.filters;
      if (filtersWerePatched) {
        nextFilters = sanitizeFilters({ ...latestView.filters, ...patch.filters });
        if (Object.prototype.hasOwnProperty.call(patch.filters, 'make')) {
          nextFilters.model = pruneModelsForMakes(
            nextFilters.model,
            nextFilters.make,
            latestView.modelsByMake,
          );
        }
      }
      const nextSortModel = sortWasPatched
        ? parseSort(
            Array.isArray(patch.sortModel) && patch.sortModel[0]
              ? `${patch.sortModel[0].field}:${patch.sortModel[0].sort}`
              : '',
          )
        : latestView.parsedView.sortModel;
      const requestedPagination = paginationWasPatched
        ? patch.paginationModel ?? {}
        : {};
      const requestedSize = parsePageSize(requestedPagination.pageSize);
      const pageSize =
        requestedSize ?? latestView.paginationModel.pageSize;
      const shouldResetPage =
        queryWasPatched ||
        filtersWerePatched ||
        sortWasPatched ||
        (requestedSize !== null &&
          requestedSize !== latestView.paginationModel.pageSize);
      const requestedPage =
        Number.isInteger(requestedPagination.page) &&
        requestedPagination.page >= 0
          ? requestedPagination.page
          : latestView.paginationModel.page;
      const nextPage = shouldResetPage
        ? 0
        : clampPage(
            requestedPage,
            pageSize,
            latestView.derived.rowCount,
            latestView.ready,
          );

      setSearchParams(
        serializeView({
          query: nextQuery,
          filters: nextFilters,
          sortModel: nextSortModel,
          paginationModel: { page: nextPage, pageSize },
        }),
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    ...parsedView,
    ...derived,
    sortModel,
    activeRows,
    dataErrors,
    filters,
    filterOptions,
    activeFilterCount: countActiveFilters(filters),
    paginationModel,
    pageRows,
    update,
  };
}
