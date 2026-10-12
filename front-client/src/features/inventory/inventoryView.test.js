import { describe, expect, it } from 'vitest';
import { deriveInventory, SORTABLE_FIELDS } from './inventoryView';
import { AUCTION_PHASE } from '../vehicles/auctionTime';

const now = new Date('2026-10-10T12:00:00Z');

const vehicle = (id, auction_end, values = {}) => ({
  id,
  year: 2022,
  make: 'Toyota',
  model: 'Camry',
  vin: `vin-${id}`,
  auction_start: '2026-10-01T00:00:00',
  auction_end,
  ...values,
});

describe('deriveInventory', () => {
  it('exports shared sortable descriptors for the real grid fields', () => {
    expect(SORTABLE_FIELDS).toEqual([
      { field: 'year', label: 'Year' },
      { field: 'make', label: 'Make' },
      { field: 'model', label: 'Model' },
      { field: 'current_bid', label: 'Current bid' },
      { field: 'odometer_mi', label: 'Mileage' },
      { field: 'trim', label: 'Trim' },
      { field: 'auction_end', label: 'Time left' },
    ]);
  });

  it('excludes ended auctions at the exact boundary and retains future and no-end rows', () => {
    const result = deriveInventory(
      [
        vehicle('closed', '2026-10-10T12:00:00'),
        vehicle('upcoming', '2026-10-12T12:00:00', {
          auction_start: '2026-10-11T12:00:00',
        }),
        vehicle('no-end', null),
      ],
      now,
    );

    expect(result.activeRows.map(({ id, auctionPhase }) => [id, auctionPhase])).toEqual([
      ['upcoming', AUCTION_PHASE.UPCOMING],
      ['no-end', AUCTION_PHASE.OPEN_ENDED],
    ]);
    expect(result.orderedRows.map(({ id }) => id)).toEqual(['upcoming', 'no-end']);
    expect(result.dataErrors).toEqual([]);
  });

  it('reports invalid timestamps and does not include them in active rows', () => {
    const badStart = vehicle('bad-start', '2026-10-12T12:00:00', {
      auction_start: 'bad date',
    });
    const badEnd = vehicle('bad-end', 'bad date');
    const result = deriveInventory([badStart, badEnd], now);

    expect(result.activeRows).toEqual([]);
    expect(result.dataErrors.map(({ id, fields }) => [id, fields])).toEqual([
      ['bad-start', ['auction_start']],
      ['bad-end', ['auction_end']],
    ]);
  });

  it('sorts finite ends ascending, null ends last and breaks ties by id', () => {
    const result = deriveInventory(
      [
        vehicle('no-end', null),
        vehicle('z', '2026-10-12T12:00:00'),
        vehicle('early', '2026-10-11T12:00:00'),
        vehicle('a', '2026-10-12T12:00:00'),
      ],
      now,
    );

    expect(result.orderedRows.map(({ id }) => id)).toEqual([
      'early',
      'a',
      'z',
      'no-end',
    ]);
  });

  it('orders by remaining time across timezone offsets before pagination', () => {
    const records = [
      vehicle('later', '2026-10-10T09:00:00-05:00'),
      vehicle('soon', '2026-10-10T14:05:00+02:00'),
      vehicle('closed', '2026-10-10T06:59:00-05:00'),
      vehicle('no-end', null),
    ];
    expect(deriveInventory(records, now).pageRows.map(({ id }) => id))
      .toEqual(['soon', 'later', 'no-end']);
    expect(deriveInventory(records, new Date('2026-10-10T12:05:00Z')).pageRows.map(({ id }) => id))
      .toEqual(['later', 'no-end']);
  });

  it('sorts real trim values and ignores removed column sort requests', () => {
    const records = [
      vehicle('a', '2026-10-12T12:00:00', { trim: 'Sport' }),
      vehicle('b', '2026-10-11T12:00:00', { trim: 'Limited' }),
    ];
    expect(deriveInventory(records, now, { sortModel: [{ field: 'trim', sort: 'desc' }] }).orderedRows.map(({ id }) => id))
      .toEqual(['a', 'b']);
    for (const field of ['condition', 'body_style']) {
      expect(deriveInventory(records, now, { sortModel: [{ field, sort: 'desc' }] }).orderedRows.map(({ id }) => id))
        .toEqual(['b', 'a']);
    }
  });

  it('searches real year, make, model and VIN fields case-insensitively', () => {
    const records = [
      vehicle('one', '2026-10-12T12:00:00', {
        year: 2018,
        make: 'Honda',
        model: 'Accord',
        vin: 'ABC123',
      }),
      vehicle('two', '2026-10-13T12:00:00', {
        year: 2020,
        make: 'Ford',
        model: 'Escape',
        vin: 'XYZ789',
      }),
    ];

    for (const query of ['2018', 'hONdA', 'accord', 'abc123']) {
      expect(deriveInventory(records, now, { query }).orderedRows.map(({ id }) => id))
        .toEqual(['one']);
    }
  });

  it('sorts selected fields and slices one zero-based page without mutating records', () => {
    const records = [
      vehicle('a', '2026-10-12T12:00:00', { current_bid: 200 }),
      vehicle('b', '2026-10-13T12:00:00', { current_bid: 100 }),
      vehicle('c', '2026-10-14T12:00:00', { current_bid: 300 }),
      vehicle('d', '2026-10-15T12:00:00', { current_bid: 400 }),
      vehicle('e', '2026-10-16T12:00:00', { current_bid: 500 }),
      vehicle('f', '2026-10-17T12:00:00', { current_bid: 600 }),
    ];
    const result = deriveInventory(records, now, {
      sortModel: [{ field: 'current_bid', sort: 'asc' }],
      paginationModel: { page: 1, pageSize: 5 },
    });

    expect(result.orderedRows.map(({ id }) => id)).toEqual([
      'b', 'a', 'c', 'd', 'e', 'f',
    ]);
    expect(result.pageRows.map(({ id }) => id)).toEqual(['f']);
    expect(result.rowCount).toBe(6);
    expect(result.paginationModel).toEqual({ page: 1, pageSize: 5 });
    expect(records[0]).not.toHaveProperty('auctionPhase');
  });

  it('keeps null ends last even when the selected end-time sort is descending', () => {
    const result = deriveInventory(
      [
        vehicle('no-end', null),
        vehicle('soon', '2026-10-11T12:00:00'),
        vehicle('later', '2026-10-12T12:00:00'),
      ],
      now,
      { sortModel: [{ field: 'auction_end', sort: 'desc' }] },
    );

    expect(result.orderedRows.map(({ id }) => id)).toEqual(['later', 'soon', 'no-end']);
  });
});
