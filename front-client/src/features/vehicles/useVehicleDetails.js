import { useCallback, useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useVehicleCatalog } from '../../context/VehicleCatalogContext';
import { getVehicle } from '../../services/vehicleService';

/**
 * Details data for one vehicle. A cached catalog record renders immediately,
 * and the vehicle is always revalidated with GET /api/the-block/:id so a
 * direct load or refresh never needs an inventory visit and auction state is
 * fresh. The fetched record is merged into the catalog, which stays the
 * single source the page reads from (so accepted Buy Now/bid results show).
 *
 * @returns {{ vehicle, status: 'loading'|'ready'|'not-found'|'error', error, refreshing, retry }}
 */
export function useVehicleDetails(id) {
  const { getById, upsertRecord } = useVehicleCatalog();
  // The catalog resets on user switch; refetch so the record is restored.
  const userId = useUser().user?.id ?? null;
  const [request, setRequest] = useState({ id, attempt: 0, status: 'loading', error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ id, attempt, status: 'loading', error: null });
    getVehicle(id, { signal: controller.signal })
      .then((record) => {
        if (!record) {
          setRequest({ id, attempt, status: 'not-found', error: null });
          return;
        }
        upsertRecord(record);
        setRequest({ id, attempt, status: 'ready', error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') {
          return;
        }
        setRequest({
          id,
          attempt,
          status: error?.status === 404 ? 'not-found' : 'error',
          error,
        });
      });
    return () => controller.abort();
  }, [id, attempt, userId, upsertRecord]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  // Ignore results that belong to a previous :id while the new one loads.
  const current = request.id === id ? request : { status: 'loading', error: null };
  const cached = getById(id) ?? null;

  if (current.status === 'not-found') {
    return { vehicle: null, status: 'not-found', error: null, refreshing: false, retry };
  }
  if (cached) {
    return {
      vehicle: cached,
      status: 'ready',
      // A failed revalidation keeps the cached record visible with a warning.
      error: current.status === 'error' ? current.error : null,
      refreshing: current.status === 'loading',
      retry,
    };
  }
  return {
    vehicle: null,
    status: current.status === 'error' ? 'error' : 'loading',
    error: current.error,
    refreshing: false,
    retry,
  };
}
