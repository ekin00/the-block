/**
 * Pure search, filter and option-derivation helpers for the inventory.
 *
 * Every function works on mapped vehicle records with backend field names
 * (`odometer_mi`, `title_status`, `body_style`, `fuel_type`, ...). Option
 * lists and counts come from the records passed in, never from hard-coded
 * values. Callers pass the active (unexpired) inventory so closed auctions
 * can never reappear through search, filters or reset.
 */

export const ODOMETER_MIN = 0;
export const ODOMETER_MAX = 250000;
export const DEFAULT_ODOMETER = Object.freeze([ODOMETER_MIN, ODOMETER_MAX]);

/** Checkbox filter keys in sidebar order, mapped to their record field. */
export const LIST_FILTERS = Object.freeze([
  { key: 'titleType', field: 'title_status' },
  { key: 'year', field: 'year' },
  { key: 'condition', field: 'condition_grade' },
  { key: 'vehicleType', field: 'body_style' },
  { key: 'make', field: 'make' },
  { key: 'model', field: 'model' },
  { key: 'engine', field: 'engine' },
  { key: 'transmission', field: 'transmission' },
  { key: 'fuelType', field: 'fuel_type' },
  { key: 'drivetrain', field: 'drivetrain' },
]);

export const LIST_FILTER_KEYS = Object.freeze(LIST_FILTERS.map(({ key }) => key));
const FIELD_BY_KEY = Object.fromEntries(LIST_FILTERS.map(({ key, field }) => [key, field]));

export const CONDITION_BUCKETS = Object.freeze([
  { value: '4', label: 'Grade 4.0+ (Excellent)', min: 4, max: Infinity },
  { value: '3', label: 'Grade 3.0 – 3.9 (Good)', min: 3, max: 4 },
  { value: '2', label: 'Grade 2.0 – 2.9 (Fair)', min: 2, max: 3 },
  { value: '1', label: 'Grade < 2.0 (Needs Repair)', min: -Infinity, max: 2 },
]);

export function createDefaultFilters() {
  return {
    titleType: [],
    odometer: [...DEFAULT_ODOMETER],
    year: [],
    condition: [],
    vehicleType: [],
    make: [],
    model: [],
    engine: [],
    transmission: [],
    fuelType: [],
    drivetrain: [],
  };
}

const SEARCH_FIELDS = ['year', 'make', 'model', 'trim', 'vin', 'body_style'];
const WHITESPACE = /\s+/;

function normalizeText(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

function hasText(value) {
  return value != null && String(value).trim() !== '';
}

function toFiniteNumber(value) {
  if (value == null || String(value).trim() === '') {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getConditionBucket(grade) {
  const value = toFiniteNumber(grade);
  if (value === null) {
    return null;
  }
  const bucket = CONDITION_BUCKETS.find(({ min, max }) => value >= min && value < max);
  return bucket ? bucket.value : null;
}

/** Normalized comparison key for one record and list filter. */
function recordKey(record, key) {
  const value = record?.[FIELD_BY_KEY[key]];
  if (key === 'condition') {
    return getConditionBucket(value);
  }
  if (key === 'year') {
    const year = toFiniteNumber(value);
    return Number.isInteger(year) ? year : null;
  }
  return hasText(value) ? normalizeText(value) : null;
}

function selectionKey(key, value) {
  if (key === 'year') {
    const year = toFiniteNumber(value);
    return Number.isInteger(year) ? year : null;
  }
  if (key === 'condition') {
    return CONDITION_BUCKETS.some((bucket) => bucket.value === String(value))
      ? String(value)
      : null;
  }
  return hasText(value) ? normalizeText(value) : null;
}

function titleCase(value) {
  return String(value)
    .split(/([\s-]+)/)
    .map((part) => (part ? part[0].toLocaleUpperCase() + part.slice(1) : part))
    .join('');
}

function displayLabel(key, value) {
  if (key === 'year') {
    return String(value);
  }
  const text = String(value).trim();
  // Lower-case backend values (`clean`, `automatic`, `sedan`) read better
  // title-cased. Mixed or upper-case values (`SUV`, `CVT`, `CX-5`) stay as-is.
  return text === text.toLocaleLowerCase() ? titleCase(text) : text;
}

/** Whitespace-separated terms must all match year/make/model/trim/VIN/body. */
export function applySearch(records, query) {
  const source = Array.isArray(records) ? records : [];
  const terms = normalizeText(query).split(WHITESPACE).filter(Boolean);
  if (!terms.length) {
    return source;
  }
  return source.filter((record) => {
    const haystack = SEARCH_FIELDS.map((field) => normalizeText(record?.[field])).join(' ');
    return terms.every((term) => haystack.includes(term));
  });
}

function isDefaultOdometer(odometer) {
  return (
    !Array.isArray(odometer) ||
    (odometer[0] <= ODOMETER_MIN && odometer[1] >= ODOMETER_MAX)
  );
}

function buildSelectionSets(filters) {
  const sets = [];
  for (const key of LIST_FILTER_KEYS) {
    const selected = Array.isArray(filters?.[key]) ? filters[key] : [];
    if (!selected.length) {
      continue;
    }
    const set = new Set();
    for (const value of selected) {
      const normalized = selectionKey(key, value);
      if (normalized !== null) {
        set.add(normalized);
      }
    }
    sets.push([key, set]);
  }
  return sets;
}

/**
 * AND across categories, OR within a category. The odometer upper bound of
 * 250,000 means "250,000+" so high-mileage vehicles stay included.
 */
export function applyFilters(records, filters) {
  const source = Array.isArray(records) ? records : [];
  const selections = buildSelectionSets(filters);
  const odometer = filters?.odometer;
  const odometerActive = !isDefaultOdometer(odometer);
  if (!selections.length && !odometerActive) {
    return source;
  }
  const [minOdo, maxOdo] = odometerActive ? odometer : DEFAULT_ODOMETER;

  return source.filter((record) => {
    if (odometerActive) {
      const miles = toFiniteNumber(record?.odometer_mi);
      if (miles === null || miles < minOdo || (maxOdo < ODOMETER_MAX && miles > maxOdo)) {
        return false;
      }
    }
    for (const [key, set] of selections) {
      if (!set.has(recordKey(record, key))) {
        return false;
      }
    }
    return true;
  });
}

export function countActiveFilters(filters) {
  let count = isDefaultOdometer(filters?.odometer) ? 0 : 1;
  for (const key of LIST_FILTER_KEYS) {
    if (Array.isArray(filters?.[key]) && filters[key].length) {
      count += 1;
    }
  }
  return count;
}

function compareOptions(key) {
  if (key === 'year') {
    return (a, b) => b.value - a.value;
  }
  if (key === 'condition') {
    return (a, b) => Number(b.value) - Number(a.value);
  }
  return (a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base', numeric: true });
}

/**
 * Options and real counts for every list filter, derived from `records`.
 *
 * Values keep the first spelling seen in the data so selections round-trip
 * through the URL. `modelsByMake` maps each make value to its model values.
 * When `selectedMakes` is non-empty, `options.model` only lists models of
 * those makes, so the sidebar cannot offer an impossible combination.
 */
export function deriveFilterOptions(records, { selectedMakes = [] } = {}) {
  const source = Array.isArray(records) ? records : [];
  const buckets = Object.fromEntries(LIST_FILTER_KEYS.map((key) => [key, new Map()]));
  const modelsByMakeKey = new Map();
  const makeValueByKey = new Map();

  for (const record of source) {
    for (const key of LIST_FILTER_KEYS) {
      const normalized = recordKey(record, key);
      if (normalized === null) {
        continue;
      }
      const bucket = buckets[key].get(normalized);
      if (bucket) {
        bucket.count += 1;
        continue;
      }
      let value;
      if (key === 'year' || key === 'condition') {
        value = normalized;
      } else {
        value = String(record[FIELD_BY_KEY[key]]).trim();
      }
      buckets[key].set(normalized, { value, count: 1 });
    }

    const makeKey = recordKey(record, 'make');
    const modelKey = recordKey(record, 'model');
    if (makeKey !== null && modelKey !== null) {
      if (!modelsByMakeKey.has(makeKey)) {
        modelsByMakeKey.set(makeKey, new Map());
      }
      const models = modelsByMakeKey.get(makeKey);
      const existing = models.get(modelKey);
      models.set(modelKey, (existing ?? 0) + 1);
    }
  }

  for (const [makeKey, { value }] of buckets.make) {
    makeValueByKey.set(makeKey, value);
  }

  const options = {};
  for (const key of LIST_FILTER_KEYS) {
    options[key] = Array.from(buckets[key].values(), ({ value, count }) => ({
      value,
      label:
        key === 'condition'
          ? CONDITION_BUCKETS.find((bucket) => bucket.value === value).label
          : displayLabel(key, value),
      count,
    })).sort(compareOptions(key));
  }

  const modelValueByKey = new Map(
    Array.from(buckets.model, ([modelKey, { value }]) => [modelKey, value]),
  );
  const modelsByMake = {};
  for (const [makeKey, models] of modelsByMakeKey) {
    modelsByMake[makeValueByKey.get(makeKey)] = Array.from(models.keys(), (modelKey) =>
      modelValueByKey.get(modelKey),
    );
  }

  const makeKeys = new Set(
    (Array.isArray(selectedMakes) ? selectedMakes : [])
      .map((make) => selectionKey('make', make))
      .filter((make) => make !== null),
  );
  if (makeKeys.size) {
    const counts = new Map();
    for (const makeKey of makeKeys) {
      for (const [modelKey, count] of modelsByMakeKey.get(makeKey) ?? []) {
        counts.set(modelKey, (counts.get(modelKey) ?? 0) + count);
      }
    }
    options.model = options.model
      .filter((option) => counts.has(normalizeText(option.value)))
      .map((option) => ({ ...option, count: counts.get(normalizeText(option.value)) }));
  }

  return { options, modelsByMake };
}

/** Keep only selected models that belong to at least one selected make. */
export function pruneModelsForMakes(models, makes, modelsByMake) {
  const selectedModels = Array.isArray(models) ? models : [];
  const selectedMakes = Array.isArray(makes) ? makes : [];
  if (!selectedMakes.length || !selectedModels.length) {
    return selectedModels;
  }
  const allowed = new Set();
  const makeKeys = new Set(selectedMakes.map((make) => normalizeText(make)));
  for (const [make, makeModels] of Object.entries(modelsByMake ?? {})) {
    if (makeKeys.has(normalizeText(make))) {
      for (const model of makeModels) {
        allowed.add(normalizeText(model));
      }
    }
  }
  return selectedModels.filter((model) => allowed.has(normalizeText(model)));
}

/**
 * Intersect parsed filters with the options available in the active
 * inventory, then prune models against the selected makes. Callers must
 * skip this while the catalog is loading, when options are still empty.
 */
export function intersectFiltersWithOptions(filters, options, modelsByMake) {
  const next = { ...createDefaultFilters(), ...filters };
  for (const key of LIST_FILTER_KEYS) {
    const available = new Map(
      (options?.[key] ?? []).map((option) => [selectionKey(key, option.value), option.value]),
    );
    const seen = new Set();
    next[key] = (Array.isArray(next[key]) ? next[key] : []).flatMap((value) => {
      const normalized = selectionKey(key, value);
      if (normalized === null || !available.has(normalized) || seen.has(normalized)) {
        return [];
      }
      seen.add(normalized);
      return [available.get(normalized)];
    });
  }
  next.model = pruneModelsForMakes(next.model, next.make, modelsByMake);
  return next;
}

/** Unique lower-case make, model and "make model" suggestions. */
export function deriveSearchSuggestions(records) {
  const suggestions = new Set();
  for (const record of Array.isArray(records) ? records : []) {
    const make = normalizeText(record?.make);
    const model = normalizeText(record?.model);
    if (make) {
      suggestions.add(make);
    }
    if (model) {
      suggestions.add(model);
    }
    if (make && model) {
      suggestions.add(`${make} ${model}`);
    }
  }
  return Array.from(suggestions).sort();
}
