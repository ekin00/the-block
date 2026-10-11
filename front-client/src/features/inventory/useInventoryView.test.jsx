import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { useInventoryView } from './useInventoryView';

const records = Array.from({ length: 12 }, (_, index) => ({
  id: `vehicle-${index + 1}`,
  year: 2020 + index,
  make: 'Toyota',
  model: 'Camry',
  vin: `VIN-${index + 1}`,
  auction_start: '2026-10-01T00:00:00',
  auction_end: `2026-10-${String(11 + index).padStart(2, '0')}T00:00:00`,
}));
const now = new Date('2026-10-10T12:00:00Z');

function wrapperAt(url) {
  // The wrapper's children are injected by Testing Library.
  // eslint-disable-next-line react/prop-types
  return function Wrapper({ children }) {
    return <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;
  };
}

// Rendered outside <Routes> on purpose: the hook stays mounted on
// /vehicles/:id, which proves it never writes to a non-inventory URL.
// eslint-disable-next-line react/prop-types
function RoundTripProbe({ isMobile = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const view = useInventoryView({
    isMobile,
    records,
    now,
    ready: true,
  });
  return (
    <>
      <output data-testid="location">{location.pathname + location.search}</output>
      <output data-testid="page-size">{view.paginationModel.pageSize}</output>
      <output data-testid="query">{view.query}</output>
      <output data-testid="sort">{JSON.stringify(view.sortModel)}</output>
      <button onClick={() => view.update({ query: 'Toyota' })}>Commit query</button>
      <button onClick={() => navigate('/vehicles/vehicle-1')}>Details</button>
      <button onClick={() => navigate('/inventory')}>Inventory</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}

describe('useInventoryView', () => {
  it('sanitizes malformed state and cleans unknown keys on the next write', () => {
    render(
      <MemoryRouter initialEntries={['/inventory?q=%20%20Toyota%20&sort=unknown:side&page=0&size=30&extra=1']}>
        <RoundTripProbe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('query').textContent).toBe('Toyota');
    expect(screen.getByTestId('sort').textContent).toBe('[]');
    expect(screen.getByTestId('page-size').textContent).toBe('25');
    act(() => screen.getByRole('button', { name: 'Commit query' }).click());

    const cleaned = new URL(
      screen.getByTestId('location').textContent,
      'http://localhost',
    );
    expect(cleaned.pathname).toBe('/inventory');
    expect([...cleaned.searchParams.entries()]).toEqual([
      ['q', 'Toyota'],
      ['size', '25'],
    ]);
  });

  it('uses a mobile default once and keeps it through resize', () => {
    const { result, rerender } = renderHook(
      ({ isMobile }) =>
        useInventoryView({ isMobile, records, now, ready: true }),
      {
        initialProps: { isMobile: true },
        wrapper: wrapperAt('/inventory'),
      },
    );

    expect(result.current.paginationModel.pageSize).toBe(10);
    rerender({ isMobile: false });
    expect(result.current.paginationModel.pageSize).toBe(10);
  });

  it('uses the desktop default and keeps it when resized to mobile', () => {
    const { result, rerender } = renderHook(
      ({ isMobile }) =>
        useInventoryView({ isMobile, records, now, ready: true }),
      {
        initialProps: { isMobile: false },
        wrapper: wrapperAt('/inventory'),
      },
    );

    expect(result.current.paginationModel.pageSize).toBe(25);
    rerender({ isMobile: true });
    expect(result.current.paginationModel.pageSize).toBe(25);
  });

  it('clamps pages only after the inventory is ready', () => {
    const { result, rerender } = renderHook(
      ({ ready }) =>
        useInventoryView({ isMobile: false, records, now, ready }),
      {
        initialProps: { ready: false },
        wrapper: wrapperAt('/inventory?page=9&size=5'),
      },
    );

    expect(result.current.paginationModel.page).toBe(8);
    rerender({ ready: true });
    expect(result.current.paginationModel.page).toBe(2);
    expect(result.current.pageRows).toHaveLength(2);
  });

  it('resets page for query, sort and page-size changes and serializes one-based pages', () => {
    const { result } = renderHook(
      () =>
        useInventoryView({ isMobile: false, records, now, ready: true }),
      { wrapper: wrapperAt('/inventory?page=2&size=5&obsolete=yes') },
    );

    act(() => {
      result.current.update({
        paginationModel: { page: 1, pageSize: 5 },
      });
    });
    expect(result.current.paginationModel.page).toBe(1);

    act(() => result.current.update({ query: 'Honda' }));
    expect(result.current.paginationModel.page).toBe(0);
    expect(result.current.rowCount).toBe(0);

    act(() =>
      result.current.update({
        sortModel: [{ field: 'year', sort: 'desc' }],
      }),
    );
    expect(result.current.sortModel).toEqual([{ field: 'year', sort: 'desc' }]);
    expect(result.current.paginationModel.page).toBe(0);

    act(() => {
      result.current.update({
        paginationModel: { page: 2, pageSize: 10 },
      });
    });
    expect(result.current.paginationModel.page).toBe(0);
    expect(result.current.paginationModel.pageSize).toBe(10);
  });

  it('keeps a delayed update from overwriting newer sort or page-size state', () => {
    const { result } = renderHook(
      () =>
        useInventoryView({ isMobile: false, records, now, ready: true }),
      { wrapper: wrapperAt('/inventory?page=2&size=5') },
    );
    const delayedUpdate = result.current.update;

    act(() => {
      result.current.update({
        sortModel: [{ field: 'year', sort: 'desc' }],
        paginationModel: { page: 0, pageSize: 10 },
      });
    });
    act(() => delayedUpdate({ query: 'Toyota' }));

    expect(result.current.query).toBe('Toyota');
    expect(result.current.sortModel).toEqual([{ field: 'year', sort: 'desc' }]);
    expect(result.current.paginationModel).toEqual({ page: 0, pageSize: 10 });
  });

  it('pins the viewport default size once and keeps it across resize, details and Back', async () => {
    const view = render(
      <MemoryRouter initialEntries={['/inventory?q=Toyota']}>
        <RoundTripProbe />
      </MemoryRouter>,
    );
    const location = () => screen.getByTestId('location').textContent;

    await waitFor(() => expect(location()).toBe('/inventory?q=Toyota&size=25'));

    view.rerender(
      <MemoryRouter initialEntries={['/inventory?q=Toyota']}>
        <RoundTripProbe isMobile />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('page-size').textContent).toBe('25');
    expect(location()).toBe('/inventory?q=Toyota&size=25');

    act(() => screen.getByRole('button', { name: 'Details' }).click());
    expect(location()).toBe('/vehicles/vehicle-1');
    await act(async () => {});
    expect(location()).toBe('/vehicles/vehicle-1');

    act(() => screen.getByRole('button', { name: 'Back' }).click());
    expect(location()).toBe('/inventory?q=Toyota&size=25');
    expect(screen.getByTestId('page-size').textContent).toBe('25');
  });

  it('resets a bare inventory link to the current viewport default', async () => {
    const view = render(
      <MemoryRouter initialEntries={['/inventory?q=Toyota&size=25']}>
        <RoundTripProbe />
      </MemoryRouter>,
    );
    view.rerender(
      <MemoryRouter initialEntries={['/inventory?q=Toyota&size=25']}>
        <RoundTripProbe isMobile />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('page-size').textContent).toBe('25');

    act(() => screen.getByRole('button', { name: 'Inventory' }).click());
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe('/inventory?size=10'),
    );
    expect(screen.getByTestId('page-size').textContent).toBe('10');
    expect(screen.getByTestId('query').textContent).toBe('');
  });

  it('replaces an invalid size with the viewport default and drops unknown keys', async () => {
    render(
      <MemoryRouter initialEntries={['/inventory?size=30&sort=year:asc&extra=1']}>
        <RoundTripProbe isMobile />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/inventory?sort=year%3Aasc&size=10',
      ),
    );
  });

  it('does not normalize when mounted on a non-inventory route', async () => {
    render(
      <MemoryRouter initialEntries={['/vehicles/vehicle-1']}>
        <RoundTripProbe />
      </MemoryRouter>,
    );
    await act(async () => {});
    expect(screen.getByTestId('location').textContent).toBe('/vehicles/vehicle-1');
  });
});

describe('useInventoryView filters', () => {
  const filterRecords = [
    ...Array.from({ length: 30 }, (_, index) => ({
      id: `t-${index}`, year: 2020, make: 'Toyota', model: index % 2 ? 'Camry' : 'Corolla',
      vin: `T${index}`, odometer_mi: 1000 * index,
      auction_start: '2026-10-01T00:00:00', auction_end: '2026-10-20T00:00:00',
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      id: `h-${index}`, year: 2018, make: 'Honda', model: 'Civic',
      vin: `H${index}`, odometer_mi: 200000,
      auction_start: '2026-10-01T00:00:00', auction_end: '2026-10-20T00:00:00',
    })),
  ];

  function renderFilterHook(url, { ready = true, recordsValue = filterRecords } = {}) {
    let writes = 0;
    const hook = renderHook(
      (props) => {
        const location = useLocation();
        const view = useInventoryView({ isMobile: false, now, ...props });
        return { view, url: location.pathname + location.search, key: location.key };
      },
      {
        initialProps: { records: recordsValue, ready },
        wrapper: wrapperAt(url),
      },
    );
    const act2 = (fn) => {
      const before = hook.result.current.url;
      act(fn);
      if (hook.result.current.url !== before) writes += 1;
    };
    return { hook, act: act2, writes: () => writes };
  }

  it('round-trips repeated filter keys and odometer through the URL', () => {
    const { hook } = renderFilterHook('/inventory?make=Toyota&make=Honda&model=Civic&year=2018&odo=100000-250000&size=25');
    const { view } = hook.result.current;
    expect(view.filters.make).toEqual(['Toyota', 'Honda']);
    expect(view.filters.model).toEqual(['Civic']);
    expect(view.filters.year).toEqual([2018]);
    expect(view.filters.odometer).toEqual([100000, 250000]);
    expect(view.rowCount).toBe(5);
    expect(view.activeFilterCount).toBe(4);
    expect(view.filterOptions.model.map(({ value }) => value)).toEqual(['Camry', 'Civic', 'Corolla']);
    act(() => view.update({ query: 'civic' }));
    expect(hook.result.current.url).toBe(
      '/inventory?q=civic&year=2018&make=Toyota&make=Honda&model=Civic&odo=100000-250000&size=25',
    );
  });

  it('sanitizes hostile filter params', () => {
    const long = 'x'.repeat(101);
    const { hook } = renderFilterHook(
      `/inventory?make=${long}&make=%20toyota%20&make=TOYOTA&year=20x0&year=99999&condition=7&odo=900000-5&size=25`,
    );
    const { filters } = hook.result.current.view;
    expect(filters.make).toEqual(['Toyota']);
    expect(filters.year).toEqual([]);
    expect(filters.condition).toEqual([]);
    expect(filters.odometer).toEqual([5, 250000]);
  });

  it('keeps stale values while loading and drops them once ready', () => {
    const { hook } = renderFilterHook('/inventory?make=Tesla&make=Honda&size=25', { ready: false, recordsValue: [] });
    expect(hook.result.current.view.filters.make).toEqual(['Tesla', 'Honda']);
    hook.rerender({ records: filterRecords, ready: true });
    expect(hook.result.current.view.filters.make).toEqual(['Honda']);
    expect(hook.result.current.view.rowCount).toBe(5);
    act(() => hook.result.current.view.update({ filters: { year: [2018] } }));
    expect(hook.result.current.url).toBe('/inventory?year=2018&make=Honda&size=25');
  });

  it('prunes models that no longer belong to the selected makes', () => {
    const { hook } = renderFilterHook('/inventory?make=Toyota&make=Honda&model=Camry&model=Civic&size=25');
    act(() => hook.result.current.view.update({ filters: { make: ['Honda'] } }));
    expect(hook.result.current.url).toBe('/inventory?make=Honda&model=Civic&size=25');
    act(() => hook.result.current.view.update({ filters: { make: [] } }));
    expect(hook.result.current.url).toBe('/inventory?model=Civic&size=25');
  });

  it('resets to page 1 on a filter change with a single URL write', () => {
    const harness = renderFilterHook('/inventory?page=2&size=10');
    expect(harness.hook.result.current.view.paginationModel.page).toBe(1);
    harness.act(() => harness.hook.result.current.view.update({ filters: { odometer: [0, 10000] } }));
    expect(harness.hook.result.current.url).toBe('/inventory?odo=0-10000&size=10');
    expect(harness.hook.result.current.view.rowCount).toBe(11);
    expect(harness.writes()).toBe(1);
    harness.act(() => harness.hook.result.current.view.update({ query: '', filters: { odometer: [0, 250000] } }));
    expect(harness.hook.result.current.url).toBe('/inventory?size=10');
  });
});
