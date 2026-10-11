import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  applySearch,
  countActiveFilters,
  createDefaultFilters,
  deriveFilterOptions,
  deriveSearchSuggestions,
  getConditionBucket,
  intersectFiltersWithOptions,
  pruneModelsForMakes,
} from './inventoryFilters';

const vehicle = (id, overrides = {}) => ({
  id,
  year: 2020,
  make: 'Toyota',
  model: 'Camry',
  trim: 'SE',
  vin: `VIN${id}`,
  body_style: 'sedan',
  title_status: 'clean',
  condition_grade: 4.2,
  engine: '2.5L I4',
  transmission: 'automatic',
  fuel_type: 'gasoline',
  drivetrain: 'FWD',
  odometer_mi: 40000,
  ...overrides,
});

const records = [
  vehicle('a'),
  vehicle('b', { make: 'Honda', model: 'Civic', year: 2018, title_status: 'salvage', condition_grade: 2.4, transmission: 'manual', odometer_mi: 120000 }),
  vehicle('c', { make: 'Honda', model: 'CR-V', body_style: 'SUV', year: 2022, drivetrain: 'AWD', condition_grade: 3.5, fuel_type: 'hybrid', odometer_mi: 260000 }),
  vehicle('d', { make: 'Ford', model: 'F-150', body_style: 'truck', title_status: 'rebuilt', condition_grade: 1.8, drivetrain: '4WD', odometer_mi: null }),
];
const ids = (rows) => rows.map(({ id }) => id).join(',');
const filters = (patch) => ({ ...createDefaultFilters(), ...patch });

describe('getConditionBucket', () => {
  it('maps grades to bucket boundaries', () => {
    expect([4, 4.9, 3, 3.99, 2, 2.9, 1.99, 0].map(getConditionBucket)).toEqual(['4', '4', '3', '3', '2', '2', '1', '1']);
    expect(getConditionBucket(null)).toBeNull();
    expect(getConditionBucket('bad')).toBeNull();
  });
});

describe('applySearch', () => {
  it('requires every whitespace term across year, make, model, trim, VIN and body style', () => {
    expect(ids(applySearch(records, 'honda'))).toBe('b,c');
    expect(ids(applySearch(records, '  HONDA   suv '))).toBe('c');
    expect(ids(applySearch(records, '2018 civic'))).toBe('b');
    expect(ids(applySearch(records, 'vind'))).toBe('d');
    expect(ids(applySearch(records, 'honda truck'))).toBe('');
    expect(applySearch(records, '   ')).toBe(records);
  });
});

describe('applyFilters', () => {
  it('returns the input untouched with default filters', () => {
    expect(applyFilters(records, createDefaultFilters())).toBe(records);
  });

  it('matches every list category case-insensitively', () => {
    expect(ids(applyFilters(records, filters({ titleType: ['SALVAGE'] })))).toBe('b');
    expect(ids(applyFilters(records, filters({ year: ['2022'] })))).toBe('c');
    expect(ids(applyFilters(records, filters({ condition: ['1'] })))).toBe('d');
    expect(ids(applyFilters(records, filters({ vehicleType: ['suv'] })))).toBe('c');
    expect(ids(applyFilters(records, filters({ make: ['honda'] })))).toBe('b,c');
    expect(ids(applyFilters(records, filters({ model: ['f-150'] })))).toBe('d');
    expect(ids(applyFilters(records, filters({ engine: ['2.5l i4'] })))).toBe('a,b,c,d');
    expect(ids(applyFilters(records, filters({ transmission: ['Manual'] })))).toBe('b');
    expect(ids(applyFilters(records, filters({ fuelType: ['Hybrid'] })))).toBe('c');
    expect(ids(applyFilters(records, filters({ drivetrain: ['awd', '4wd'] })))).toBe('c,d');
  });

  it('ORs within a category and ANDs across categories', () => {
    expect(ids(applyFilters(records, filters({ make: ['Honda', 'Ford'] })))).toBe('b,c,d');
    expect(ids(applyFilters(records, filters({ make: ['Honda', 'Ford'], condition: ['2', '1'] })))).toBe('b,d');
  });

  it('treats the odometer maximum as 250k+ and excludes unknown mileage only when active', () => {
    expect(ids(applyFilters(records, filters({ odometer: [100000, 250000] })))).toBe('b,c');
    expect(ids(applyFilters(records, filters({ odometer: [0, 100000] })))).toBe('a');
    expect(ids(applyFilters(records, filters({ odometer: [0, 250000] })))).toBe('a,b,c,d');
  });

  it('ignores invalid selections', () => {
    expect(ids(applyFilters(records, filters({ year: ['abc'], condition: ['9'] })))).toBe('');
  });
});

describe('countActiveFilters', () => {
  it('counts categories and a non-default odometer', () => {
    expect(countActiveFilters(createDefaultFilters())).toBe(0);
    expect(countActiveFilters(filters({ make: ['Honda', 'Ford'], odometer: [0, 1000] }))).toBe(2);
  });
});

describe('deriveFilterOptions', () => {
  it('derives real counts, labels and ordering from records', () => {
    const { options, modelsByMake } = deriveFilterOptions(records);
    expect(options.make).toEqual([
      { value: 'Ford', label: 'Ford', count: 1 },
      { value: 'Honda', label: 'Honda', count: 2 },
      { value: 'Toyota', label: 'Toyota', count: 1 },
    ]);
    expect(options.year.map(({ value }) => value)).toEqual([2022, 2020, 2018]);
    expect(options.condition.map(({ value, count }) => `${value}:${count}`)).toEqual(['4:1', '3:1', '2:1', '1:1']);
    expect(options.titleType.map(({ label }) => label)).toEqual(['Clean', 'Rebuilt', 'Salvage']);
    expect(options.vehicleType.find(({ value }) => value === 'SUV').label).toBe('SUV');
    expect(modelsByMake).toEqual({ Toyota: ['Camry'], Honda: ['Civic', 'CR-V'], Ford: ['F-150'] });
  });

  it('keeps the first spelling and merges case variants', () => {
    const { options } = deriveFilterOptions([vehicle('x', { make: 'Toyota' }), vehicle('y', { make: 'TOYOTA' })]);
    expect(options.make).toEqual([{ value: 'Toyota', label: 'Toyota', count: 2 }]);
  });

  it('constrains model options and counts to the selected makes', () => {
    const { options } = deriveFilterOptions(records, { selectedMakes: ['honda'] });
    expect(options.model).toEqual([
      { value: 'Civic', label: 'Civic', count: 1 },
      { value: 'CR-V', label: 'CR-V', count: 1 },
    ]);
    expect(options.make).toHaveLength(3);
  });

  it('handles empty input', () => {
    const { options, modelsByMake } = deriveFilterOptions(undefined);
    expect(options.make).toEqual([]);
    expect(modelsByMake).toEqual({});
  });
});

describe('pruneModelsForMakes and intersectFiltersWithOptions', () => {
  const { options, modelsByMake } = deriveFilterOptions(records);

  it('keeps only models belonging to a selected make', () => {
    expect(pruneModelsForMakes(['Camry', 'Civic'], ['Honda'], modelsByMake)).toEqual(['Civic']);
    expect(pruneModelsForMakes(['Camry'], [], modelsByMake)).toEqual(['Camry']);
  });

  it('drops stale values, canonicalizes spelling and types, dedupes and prunes models', () => {
    const next = intersectFiltersWithOptions(
      filters({ make: ['honda', 'HONDA', 'Tesla'], model: ['camry', 'civic'], year: ['2018', '1999'], condition: ['4', '0'] }),
      options,
      modelsByMake,
    );
    expect(next.make).toEqual(['Honda']);
    expect(next.model).toEqual(['Civic']);
    expect(next.year).toEqual([2018]);
    expect(next.condition).toEqual(['4']);
    expect(next.odometer).toEqual([0, 250000]);
  });
});

describe('deriveSearchSuggestions', () => {
  it('returns sorted unique make, model and make-model suggestions', () => {
    expect(deriveSearchSuggestions([vehicle('a'), vehicle('b'), { make: 'Ford' }])).toEqual([
      'camry', 'ford', 'toyota', 'toyota camry',
    ]);
  });
});
