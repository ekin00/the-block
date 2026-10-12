import { describe, it, expect } from 'vitest';
import { mapVehicle } from './vehicleMapping';

const apiRecord = {
  id: '6f4d2c10-6f0d-4c7f-9a2b-0d4f0d6b7a11',
  vin: '1HGCM82633A004352',
  year: 2020,
  make: 'Toyota',
  model: 'Corolla',
  odometer_mi: 45210,
  odometer_km: 72758,
  selling_dealership: 'Dixie Auto Liquidators',
  title_status: 'Clean Title',
  auction_start: '2026-10-08T14:00:00',
  auction_end: '2026-10-13T14:00:00',
  starting_bid: 5000,
  current_bid: 8200,
  bid_count: 3,
};

describe('mapVehicle', () => {
  it('keeps backend field names on the view model', () => {
    const vehicle = mapVehicle(apiRecord);
    expect(vehicle.odometer_mi).toBe(45210);
    expect(vehicle.selling_dealership).toBe('Dixie Auto Liquidators');
    expect(vehicle.title_status).toBe('Clean Title');
  });

  it('never introduces mock field names', () => {
    const vehicle = mapVehicle(apiRecord);
    expect(vehicle).not.toHaveProperty('mileage');
    expect(vehicle).not.toHaveProperty('seller');
    expect(vehicle).not.toHaveProperty('title_type');
  });

  it('coerces the id to a string', () => {
    expect(mapVehicle({ ...apiRecord, id: 42 }).id).toBe('42');
  });

  it('returns null for empty or id-less input', () => {
    expect(mapVehicle(null)).toBeNull();
    expect(mapVehicle(undefined)).toBeNull();
    expect(mapVehicle({ make: 'No ID' })).toBeNull();
  });
});
