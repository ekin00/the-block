import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VehicleCatalogProvider, useVehicleCatalog } from './VehicleCatalogContext';

const mocks = vi.hoisted(() => ({
  listVehicles: vi.fn(),
  user: { id: 1 },
}));
vi.mock('./UserContext', () => ({ useUser: () => ({ user: mocks.user }) }));
vi.mock('../services/vehicleService', () => ({ listVehicles: mocks.listVehicles }));

let currentCatalog;
function Consumer() {
  const catalog = useVehicleCatalog();
  const { ensureLoaded } = catalog;
  currentCatalog = catalog;
  useEffect(() => { ensureLoaded(); }, [ensureLoaded]);
  return <output>{catalog.status}:{catalog.records.length}</output>;
}
afterEach(() => {
  cleanup();
  mocks.user = { id: 1 };
  vi.clearAllMocks();
});

describe('VehicleCatalogProvider inventory loading', () => {
  it('deduplicates the full-array request and preserves closed records', async () => {
    const records = [
      { id: 'closed', auction_end: '2000-01-01' },
      { id: 'open', auction_end: null },
    ];
    mocks.listVehicles.mockResolvedValue(records);
    render(<VehicleCatalogProvider><Consumer /></VehicleCatalogProvider>);
    await waitFor(() => expect(screen.getByText('ready:2')).toBeTruthy());
    await act(async () => {
      await currentCatalog.ensureLoaded();
      await currentCatalog.ensureLoaded();
    });
    expect(mocks.listVehicles).toHaveBeenCalledOnce();
    expect(currentCatalog.getById('closed')).toEqual(records[0]);
  });

  it('keeps failure retryable without automatically refetching in an effect loop', async () => {
    mocks.listVehicles.mockRejectedValueOnce(new Error('Offline'));
    mocks.listVehicles.mockResolvedValueOnce([{ id: 'retry' }]);
    render(<VehicleCatalogProvider><Consumer /></VehicleCatalogProvider>);
    await waitFor(() => expect(screen.getByText('error:0')).toBeTruthy());
    expect(mocks.listVehicles).toHaveBeenCalledOnce();
    expect(currentCatalog.error.message).toBe('Offline');
    await act(async () => { await currentCatalog.ensureLoaded(); });
    expect(mocks.listVehicles).toHaveBeenCalledOnce();
    await act(async () => { await currentCatalog.refresh(); });
    expect(screen.getByText('ready:1')).toBeTruthy();
    expect(mocks.listVehicles).toHaveBeenCalledTimes(2);
  });

  it('discards a stale catalog response when the joined user switches', async () => {
    let resolveFirst;
    let resolveSecond;
    mocks.listVehicles
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));
    const tree = () => <VehicleCatalogProvider><Consumer /></VehicleCatalogProvider>;
    const { rerender } = render(tree());
    await waitFor(() => expect(mocks.listVehicles).toHaveBeenCalledOnce());
    const firstSignal = mocks.listVehicles.mock.calls[0][0].signal;
    mocks.user = { id: 2 };
    rerender(tree());
    await waitFor(() => expect(mocks.listVehicles).toHaveBeenCalledTimes(2));
    expect(firstSignal.aborted).toBe(true);
    await act(async () => { resolveSecond([{ id: 'new-user' }]); });
    expect(currentCatalog.getById('new-user')).toBeTruthy();
    await act(async () => { resolveFirst([{ id: 'old-user' }]); });
    expect(currentCatalog.getById('old-user')).toBeUndefined();
    expect(currentCatalog.records).toEqual([{ id: 'new-user' }]);
  });
});
