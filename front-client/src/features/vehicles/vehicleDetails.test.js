import { describe, expect, it } from 'vitest';
import { AUCTION_PHASE } from './auctionTime';
import { getBidAvailability, getBuyNowAvailability, getReserveStatus } from './auctionActions';
import { formatDuration, formatLabel, formatMiles, formatMoney } from './vehicleFormat';
import { getSpecRows } from './vehicleSpecs';

describe('vehicleFormat', () => {
  it('formats money, miles and labels without inventing values', () => {
    expect(formatMoney(12500)).toBe('$12,500');
    expect(formatMoney(12500.5)).toBe('$12,500.50');
    expect(formatMoney(null)).toBe('—');
    expect(formatMiles(45210)).toBe('45,210 mi');
    expect(formatMiles(undefined)).toBe('Mileage unavailable');
    expect(formatLabel('all-wheel drive')).toBe('All-Wheel Drive');
    expect(formatLabel('')).toBe('—');
  });

  it('formats compact countdowns', () => {
    const minute = 60_000;
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(30_000)).toBe('<1m');
    expect(formatDuration(45 * minute)).toBe('45m');
    expect(formatDuration(192 * minute)).toBe('3h 12m');
    expect(formatDuration((52 * 60) * minute)).toBe('2d 4h');
  });
});

describe('getSpecRows', () => {
  it('lists every descriptive field in miles and never kilometres', () => {
    const rows = getSpecRows({
      vin: 'VIN1', lot: 'A-1', year: 2021, make: 'Honda', model: 'Civic', trim: 'EX',
      body_style: 'sedan', exterior_color: 'blue', interior_color: 'black', engine: '2.0L I4',
      transmission: 'automatic', drivetrain: 'FWD', fuel_type: 'gasoline',
      odometer_mi: 30000, odometer_km: 48280, title_status: 'clean',
      selling_dealership: 'Dealer', city: 'Toronto', province: 'ON',
    });
    const map = Object.fromEntries(rows);
    expect(map.Odometer).toBe('30,000 mi');
    expect(map.Location).toBe('Toronto, ON');
    expect(JSON.stringify(rows)).not.toMatch(/48,?280|km/i);
    expect(rows).toHaveLength(16);
  });
});

describe('auction actions', () => {
  const vehicle = { buy_now_price: 20000, current_bid: 15000, auction_start: '2026-01-01T00:00:00' };

  it('enables bidding only while the auction is open', () => {
    expect(getBidAvailability(vehicle, AUCTION_PHASE.OPEN)).toEqual({ available: true, reason: null });
    expect(getBidAvailability(vehicle, AUCTION_PHASE.OPEN_ENDED).available).toBe(true);
    expect(getBidAvailability(vehicle, AUCTION_PHASE.CLOSED).reason).toBe('Auction has ended.');
    expect(getBidAvailability(vehicle, AUCTION_PHASE.UPCOMING).reason).toMatch(/^Bidding opens /);
  });

  it('offers Buy Now only while open and below the Buy Now price', () => {
    expect(getBuyNowAvailability(vehicle, AUCTION_PHASE.OPEN)).toEqual({ offered: true, available: true, reason: null });
    expect(getBuyNowAvailability(vehicle, AUCTION_PHASE.OPEN_ENDED).available).toBe(true);
    expect(getBuyNowAvailability(vehicle, AUCTION_PHASE.CLOSED).available).toBe(false);
    expect(getBuyNowAvailability(vehicle, AUCTION_PHASE.UPCOMING).reason).toMatch(/^Buy Now opens /);
    expect(getBuyNowAvailability({ ...vehicle, current_bid: 20000 }, AUCTION_PHASE.OPEN).available).toBe(false);
    expect(getBuyNowAvailability({ ...vehicle, buy_now_price: null }, AUCTION_PHASE.OPEN).offered).toBe(false);
  });

  it('derives reserve status from the live price', () => {
    expect(getReserveStatus({ reserve_price: null })).toEqual({ label: 'No reserve', met: true });
    expect(getReserveStatus({ reserve_price: 10000, current_bid: 9000 }).met).toBe(false);
    expect(getReserveStatus({ reserve_price: 10000, current_bid: 10000 }).met).toBe(true);
  });
});
