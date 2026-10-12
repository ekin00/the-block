/* eslint-disable react/prop-types */
import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InventoryPage from './InventoryPage';

const catalog = vi.hoisted(() => ({
  status: 'ready', records: [], error: null,
  ensureLoaded: vi.fn(), refresh: vi.fn(),
}));
vi.mock('../context/VehicleCatalogContext', () => ({
  useVehicleCatalog: () => catalog,
}));
vi.mock('../features/vehicles/useAuctionClock', () => ({
  useAuctionClock: () => Date.parse('2026-10-10T12:00:00Z'),
}));
vi.mock('../components/inventory/InventorySearchBar', () => ({
  default: ({ value, onChange, onSearch }) => (
    <input
      aria-label="Search inventory"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => event.key === 'Enter' && onSearch()}
    />
  ),
}));
vi.mock('../components/inventory/InventorySidebarFilter', () => ({
  default: ({ filters, options, onFilterChange, onResetSection, onResetAll }) => (
    <section aria-label="Sidebar mock">
      <output data-testid="sidebar-filters">{JSON.stringify(filters)}</output>
      <output data-testid="sidebar-makes">{options.make.map(({ value, count }) => `${value}:${count}`).join(',')}</output>
      <button onClick={() => onFilterChange('make', ['Honda'])}>Filter Honda</button>
      <button onClick={() => onFilterChange('odometer', [0, 50000])}>Filter odometer</button>
      <button onClick={() => onResetSection('make')}>Reset make</button>
      <button onClick={() => onResetSection('odometer')}>Reset odometer</button>
      <button onClick={onResetAll}>Sidebar clear all</button>
    </section>
  ),
}));
const Renderer = ({ kind, rows, rowCount, paginationModel, onPaginationModelChange, onOpenDetails }) => (
  <div>
    <output data-testid="renderer">{kind}</output>
    <output data-testid="page-model">{JSON.stringify(paginationModel)}</output>
    <output data-testid="row-ids">{rows.map((row) => row.id).join(',')}</output>
    <output data-testid="row-count">{rowCount}</output>
    <button onClick={() => onPaginationModelChange({ ...paginationModel, page: 1 })}>Next page</button>
    <button onClick={() => onOpenDetails(rows[0])}>Open details</button>
  </div>
);
vi.mock('../components/inventory/VehicleGrid', () => ({
  default: (props) => <Renderer {...props} kind="grid" />,
}));
vi.mock('../components/inventory/VehicleCardList', () => ({
  default: (props) => <Renderer {...props} kind="cards" />,
}));

let mobile = false;
const listeners = new Set();
const Location = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="location">{location.pathname}{location.search}</output>
      <button onClick={() => navigate('/inventory')}>Reset inventory view</button>
    </>
  );
};
const mount = (entry = '/inventory') => render(
  <ThemeProvider theme={createTheme()}>
    <MemoryRouter initialEntries={[entry]}>
      <InventoryPage />
      <Location />
    </MemoryRouter>
  </ThemeProvider>,
);

beforeEach(() => {
  mobile = false;
  listeners.clear();
  window.matchMedia = vi.fn(() => ({
    get matches() { return mobile; },
    media: '(max-width:899.95px)',
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
  }));
  catalog.status = 'ready';
  catalog.error = null;
  catalog.records = Array.from({ length: 60 }, (_, index) => ({
    id: String(index).padStart(3, '0'),
    year: 2020, make: 'Toyota', model: 'Camry', vin: `VIN${index}`,
    auction_start: '2026-10-09T12:00:00',
    auction_end: '2026-10-11T12:00:00',
  }));
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('InventoryPage', () => {
  it('renders loading and retryable failure without mock rows', () => {
    catalog.status = 'loading';
    const { unmount } = mount();
    expect(screen.getByLabelText('Loading inventory')).toBeTruthy();
    expect(screen.queryByTestId('renderer')).toBeNull();
    unmount();
    catalog.status = 'error';
    catalog.error = new Error('Backend unavailable');
    mount();
    expect(screen.getByText('Backend unavailable')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(catalog.refresh).toHaveBeenCalledOnce();
  });

  it('starts desktop at 25 and preserves page and records when switching to cards', () => {
    mount();
    expect(screen.getByTestId('page-model').textContent).toBe('{"page":0,"pageSize":25}');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    const ids = screen.getByTestId('row-ids').textContent;
    act(() => {
      mobile = true;
      listeners.forEach((listener) => listener({ matches: true }));
    });
    expect(screen.getByTestId('renderer').textContent).toBe('cards');
    expect(screen.getByTestId('page-model').textContent).toBe('{"page":1,"pageSize":25}');
    expect(screen.getByTestId('row-ids').textContent).toBe(ids);
  });

  it('starts a fresh mobile view at 10', () => {
    mobile = true;
    mount();
    expect(screen.getByTestId('renderer').textContent).toBe('cards');
    expect(screen.getByTestId('page-model').textContent).toBe('{"page":0,"pageSize":10}');
  });

  it('keeps the draft while typing and commits once after 300ms', () => {
    vi.useFakeTimers();
    mount('/inventory?page=2');
    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    fireEvent.change(input, { target: { value: 'Toy' } });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.change(input, { target: { value: 'Toyota' } });
    act(() => vi.advanceTimersByTime(299));
    expect(input.value).toBe('Toyota');
    expect(screen.getByTestId('page-model').textContent).toContain('"page":1');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('location').textContent).toContain('q=Toyota');
    expect(screen.getByTestId('page-model').textContent).toContain('"page":0');
    expect(input.value).toBe('Toyota');
  });

  it('distinguishes search misses from ended auctions and reports invalid dates', () => {
    const { unmount } = mount('/inventory?q=nonexistent');
    expect(screen.getByText('No vehicles match your search.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByTestId('renderer')).toBeTruthy();
    unmount();
    catalog.records = [
      { id: 'closed', auction_end: '2026-10-09T00:00:00' },
      { id: 'bad', auction_end: 'invalid' },
    ];
    mount();
    expect(screen.getByText(/invalid auction dates/)).toBeTruthy();
    expect(screen.getByText(/No vehicles with valid, unexpired auctions/)).toBeTruthy();
    expect(screen.queryByTestId('renderer')).toBeNull();
  });

  it('resynchronizes the draft and cancels pending typing when navigation resets the query', () => {
    vi.useFakeTimers();
    mount('/inventory?q=Toyota');
    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    fireEvent.change(input, { target: { value: 'Honda' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset inventory view' }));
    expect(input.value).toBe('');
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByTestId('location').textContent).not.toContain('q=');
  });

  it('does not restore stale sorting when a delayed query commits', () => {
    vi.useFakeTimers();
    mount('/inventory?sort=year:desc');
    fireEvent.change(screen.getByRole('textbox', { name: 'Search inventory' }), { target: { value: 'Toyota' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset sorting' }));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByTestId('location').textContent).toContain('q=Toyota');
    expect(screen.getByTestId('location').textContent).not.toContain('sort=');
  });

  describe('filters', () => {
    const mixRecords = () => {
      catalog.records = catalog.records.map((record, index) => (
        index < 10 ? { ...record, make: 'Honda', model: 'Civic', odometer_mi: 20000 } : { ...record, odometer_mi: 90000 }
      ));
    };

    it('renders the desktop sidebar with real option counts and applies a filter with a page reset', () => {
      mixRecords();
      mount('/inventory?page=2');
      expect(screen.getByRole('complementary', { name: 'Inventory filters' })).toBeTruthy();
      expect(screen.getByTestId('sidebar-makes').textContent).toBe('Honda:10,Toyota:50');
      fireEvent.click(screen.getByRole('button', { name: 'Filter Honda' }));
      expect(screen.getByTestId('location').textContent).toBe('/inventory?make=Honda&size=25');
      expect(screen.getByTestId('row-count').textContent).toBe('10');
      expect(screen.getByText('10 of 60 shown')).toBeTruthy();
    });

    it('resets one section and the odometer to its full range', () => {
      mixRecords();
      mount('/inventory?make=Honda&odo=0-50000');
      expect(screen.getByTestId('row-count').textContent).toBe('10');
      fireEvent.click(screen.getByRole('button', { name: 'Reset odometer' }));
      expect(screen.getByTestId('location').textContent).toBe('/inventory?make=Honda&size=25');
      fireEvent.click(screen.getByRole('button', { name: 'Reset make' }));
      expect(screen.getByTestId('location').textContent).toBe('/inventory?size=25');
    });

    it('clears search draft and all filters in one action and shows the filter no-match state', () => {
      vi.useFakeTimers();
      mixRecords();
      mount('/inventory?q=Civic&odo=0-10000');
      expect(screen.getByText('No vehicles match your search and filters.')).toBeTruthy();
      const input = screen.getByRole('textbox', { name: 'Search inventory' });
      fireEvent.change(input, { target: { value: 'Civ' } });
      fireEvent.click(screen.getAllByRole('button', { name: 'Clear all' })[0]);
      act(() => vi.advanceTimersByTime(300));
      expect(input.value).toBe('');
      expect(screen.getByTestId('location').textContent).toBe('/inventory?size=25');
      expect(screen.getByTestId('row-count').textContent).toBe('60');
    });

    it('opens a mobile drawer with a badge, closes on Escape and returns focus to Filters', async () => {
      mobile = true;
      mixRecords();
      mount('/inventory?make=Honda&odo=0-50000');
      const trigger = screen.getByRole('button', { name: /^Filters/ });
      expect(trigger.parentElement.textContent).toContain('2');
      trigger.focus();
      fireEvent.click(trigger);
      const dialog = await screen.findByRole('dialog', { name: 'Filters' });
      expect(dialog.textContent).toContain('Show 10 vehicles');
      fireEvent.keyDown(dialog, { key: 'Escape' });
      await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
      fireEvent.click(trigger);
      fireEvent.click(await screen.findByRole('button', { name: 'Close filters' }));
      await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('passes identical filter props across the breakpoint and drops the drawer on desktop', async () => {
      mobile = true;
      mixRecords();
      mount('/inventory?make=Honda');
      fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
      await screen.findByRole('dialog');
      const mobileFilters = screen.getByTestId('sidebar-filters').textContent;
      act(() => {
        mobile = false;
        listeners.forEach((listener) => listener({ matches: false }));
      });
      await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(screen.getByTestId('sidebar-filters').textContent).toBe(mobileFilters);
      expect(screen.queryByRole('button', { name: /^Filters/ })).toBeNull();
    });
  });

  it('opens the backend vehicle ID and preserves committed view in the inventory entry', () => {
    mount('/inventory?q=Toyota&size=10&page=2');
    fireEvent.click(screen.getByRole('button', { name: 'Open details' }));
    expect(screen.getByTestId('location').textContent).toBe('/vehicles/010');
  });
});
