/* eslint-disable react/prop-types */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useUser } from './UserContext';
import { listVehicles } from '../services/vehicleService';

const VehicleCatalogContext = createContext(null);

const EMPTY_STATE = { status: 'idle', records: [], byId: new Map(), error: null };

/**
 * Single data owner for the vehicle catalog. Fetches the full array once per
 * joined user, dedupes concurrent loads with an in-flight promise, keys
 * records by UUID in a Map, and resets when the joined user changes.
 * Closed records stay in the cache; the inventory view decides visibility.
 */
export const VehicleCatalogProvider = ({ children }) => {
  const { user } = useUser();
  const userId = user?.id ?? null;
  const [state, setState] = useState(EMPTY_STATE);
  const inflightRef = useRef(null);
  const abortRef = useRef(null);
  // Request-generation token: responses from superseded loads are discarded.
  const generationRef = useRef(0);
  const prevUserIdRef = useRef(userId);

  // Reset only when the joined user actually changes. Skipping the initial
  // mount matters: child page effects fire before this parent effect, so an
  // unconditional reset would abort the very first load it just started.
  useEffect(() => {
    if (prevUserIdRef.current === userId) {
      return;
    }
    prevUserIdRef.current = userId;
    generationRef.current += 1;
    abortRef.current?.abort();
    inflightRef.current = null;
    setState(EMPTY_STATE);
  }, [userId]);

  const startLoad = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++generationRef.current;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    const promise = listVehicles({ signal: controller.signal })
      .then((records) => {
        if (generationRef.current !== generation) {
          return records; // superseded by a newer load or a user switch
        }
        setState({
          status: 'ready',
          records,
          byId: new Map(records.map((record) => [record.id, record])),
          error: null,
        });
        return records;
      })
      .catch((error) => {
        if (generationRef.current !== generation || error?.name === 'AbortError') {
          return null;
        }
        setState((prev) => ({ ...prev, status: 'error', error }));
        return null;
      })
      .finally(() => {
        if (inflightRef.current === promise) {
          inflightRef.current = null;
        }
      });
    inflightRef.current = promise;
    return promise;
  }, []);

  const ensureLoaded = useCallback(() => {
    if (inflightRef.current) {
      return inflightRef.current;
    }
    if (state.status === 'ready') {
      return Promise.resolve(state.records);
    }
    // Loading effects must leave errors visible until the user chooses Retry.
    if (state.status === 'error') {
      return Promise.resolve(null);
    }
    if (!userId) {
      return Promise.resolve(null);
    }
    return startLoad();
  }, [state.status, state.records, userId, startLoad]);

  const refresh = useCallback(() => startLoad(), [startLoad]);

  // Patch a cached record after an accepted bid so details and inventory
  // agree without a full refetch.
  const applyBidResult = useCallback((theblockId, patch) => {
    setState((prev) => {
      const existing = prev.byId.get(theblockId);
      if (!existing) {
        return prev;
      }
      const updated = { ...existing, ...patch };
      const byId = new Map(prev.byId);
      byId.set(theblockId, updated);
      return {
        ...prev,
        byId,
        records: prev.records.map((record) =>
          record.id === theblockId ? updated : record
        ),
      };
    });
  }, []);

  // Merge a directly fetched record (details direct load/refresh). Before the
  // full array has loaded only `byId` holds it, so inventory status and the
  // one-time full fetch are unaffected.
  const upsertRecord = useCallback((record) => {
    if (!record?.id) {
      return;
    }
    setState((prev) => {
      const byId = new Map(prev.byId);
      byId.set(record.id, record);
      let records = prev.records;
      if (prev.status === 'ready') {
        records = prev.byId.has(record.id)
          ? prev.records.map((existing) => (existing.id === record.id ? record : existing))
          : [...prev.records, record];
      }
      return { ...prev, byId, records };
    });
  }, []);

  const getById = useCallback((id) => state.byId.get(id), [state.byId]);

  const value = {
    status: state.status,
    records: state.records,
    byId: state.byId,
    error: state.error,
    ensureLoaded,
    refresh,
    applyBidResult,
    upsertRecord,
    getById,
  };

  return (
    <VehicleCatalogContext.Provider value={value}>
      {children}
    </VehicleCatalogContext.Provider>
  );
};

export const useVehicleCatalog = () => {
  const context = useContext(VehicleCatalogContext);
  if (!context) {
    throw new Error('useVehicleCatalog must be used within a VehicleCatalogProvider');
  }
  return context;
};
