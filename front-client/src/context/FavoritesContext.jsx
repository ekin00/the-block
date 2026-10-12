/* eslint-disable react/prop-types */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useUser } from './UserContext';
import { useVehicleCatalog } from './VehicleCatalogContext';
import {
    addFavorite,
    listFavorites,
    removeFavorite,
} from '../services/favoritesService';
import { getVehicle } from '../services/vehicleService';

const FavoritesContext = createContext(null);

const EMPTY_STATE = {
    status: 'idle',
    items: [],
    error: null,
};

/**
 * Single state owner for production user favorites.
 * Scoped to the current joined user; resets and discards stale requests on user switch.
 * Resolves full vehicle records through VehicleCatalogContext or direct fetches.
 * Closed vehicles remain visible in favorites with their closed auction status.
 */
export const FavoritesProvider = ({ children }) => {
    const { user } = useUser();
    const userId = user?.id ?? null;
    const catalog = useVehicleCatalog();
    const catalogRef = useRef(catalog);
    catalogRef.current = catalog;

    const [state, setState] = useState(EMPTY_STATE);
    const [pendingIds, setPendingIds] = useState(() => new Set());

    const inflightRef = useRef(null);
    const abortRef = useRef(null);
    const generationRef = useRef(0);
    const prevUserIdRef = useRef(userId);

    // Load favorites from backend
    const loadFavorites = useCallback(() => {
        if (!userId) {
            setState(EMPTY_STATE);
            return Promise.resolve([]);
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const generation = ++generationRef.current;

        setState((prev) => ({ ...prev, status: 'loading', error: null }));

        const promise = Promise.resolve(listFavorites({ signal: controller.signal }))
            .then(async (itemsRaw) => {
                const items = Array.isArray(itemsRaw) ? itemsRaw : [];
                if (generationRef.current !== generation) {
                    return items;
                }

                setState({
                    status: 'ready',
                    items,
                    error: null,
                });

                // Resolve any vehicles not already in catalog without causing re-render loops
                const currentCatalog = catalogRef.current;
                const missingIds = items
                    .map((item) => item.theblock_id)
                    .filter((id) => !currentCatalog?.getById?.(id));

                if (missingIds.length > 0) {
                    await Promise.allSettled(
                        missingIds.map(async (id) => {
                            try {
                                const vehicle = await getVehicle(id, { signal: controller.signal });
                                if (vehicle && generationRef.current === generation) {
                                    catalogRef.current?.upsertRecord?.(vehicle);
                                }
                            } catch {
                                // Ignore individual fetch errors (e.g. 404 removed vehicle)
                            }
                        }),
                    );
                }

                return items;
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
    }, [userId]);

    // Reset and load when user changes or initially mounts
    useEffect(() => {
        if (prevUserIdRef.current !== userId) {
            prevUserIdRef.current = userId;
            generationRef.current += 1;
            abortRef.current?.abort();
            inflightRef.current = null;
            setState(EMPTY_STATE);
            setPendingIds(new Set());
        }

        if (userId) {
            loadFavorites();
        }
    }, [userId, loadFavorites]);

    const ensureFavoritesLoaded = useCallback(() => {
        if (inflightRef.current) {
            return inflightRef.current;
        }
        if (state.status === 'ready') {
            return Promise.resolve(state.items);
        }
        if (state.status === 'error') {
            return Promise.resolve(null);
        }
        if (!userId) {
            return Promise.resolve(null);
        }
        return loadFavorites();
    }, [state.status, state.items, userId, loadFavorites]);

    const favoriteIds = useMemo(
        () => state.items.map((item) => item.theblock_id),
        [state.items],
    );

    // Derive vehicle records in the order of favorite items
    const favoriteVehicles = useMemo(
        () =>
            state.items
                .map((item) => catalog.getById(item.theblock_id))
                .filter(Boolean),
        [state.items, catalog],
    );

    const isFavorite = useCallback(
        (theblockId) => favoriteIds.includes(theblockId),
        [favoriteIds],
    );

    const isPending = useCallback(
        (theblockId) => pendingIds.has(theblockId),
        [pendingIds],
    );

    // Confirmed server mutation for adding or removing favorites
    const toggleFavorite = useCallback(
        async (theblockId, comment) => {
            if (!userId || !theblockId) {
                return { success: false, error: new Error('User or vehicle ID missing') };
            }

            if (pendingIds.has(theblockId)) {
                return { success: false, error: new Error('Action already pending') };
            }

            // Mark ID as pending
            setPendingIds((prev) => new Set(prev).add(theblockId));

            const currentlyFavorite = favoriteIds.includes(theblockId);

            try {
                if (currentlyFavorite) {
                    // DELETE returns 204 or 404
                    try {
                        await removeFavorite(theblockId);
                    } catch (err) {
                        // If already deleted on server (404), proceed to remove from local state
                        if (err?.status !== 404) {
                            throw err;
                        }
                    }

                    setState((prev) => ({
                        ...prev,
                        items: prev.items.filter((item) => item.theblock_id !== theblockId),
                    }));
                } else {
                    // POST returns 201 or 409
                    let responseItem = null;
                    try {
                        responseItem = await addFavorite({ theblockId, comment });
                    } catch (err) {
                        // If already favorite on server (409), treat as added
                        if (err?.status === 409) {
                            responseItem = {
                                theblock_id: theblockId,
                                comment: comment ?? null,
                                add_date: new Date().toISOString(),
                            };
                        } else {
                            throw err;
                        }
                    }

                    const newItem = responseItem || {
                        theblock_id: theblockId,
                        comment: comment ?? null,
                        add_date: new Date().toISOString(),
                    };

                    setState((prev) => {
                        if (prev.items.some((item) => item.theblock_id === theblockId)) {
                            return prev;
                        }
                        return {
                            ...prev,
                            items: [...prev.items, newItem],
                        };
                    });

                    // Ensure the vehicle is in catalog
                    if (!catalogRef.current?.getById?.(theblockId)) {
                        getVehicle(theblockId)
                            .then((v) => {
                                if (v) catalogRef.current?.upsertRecord?.(v);
                            })
                            .catch(() => { });
                    }
                }

                return { success: true };
            } catch (err) {
                return { success: false, error: err };
            } finally {
                setPendingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(theblockId);
                    return next;
                });
            }
        },
        [userId, pendingIds, favoriteIds],
    );

    const value = useMemo(
        () => ({
            status: state.status,
            items: state.items,
            favoriteIds,
            favoriteVehicles,
            favoriteCount: favoriteIds.length,
            error: state.error,
            isFavorite,
            isPending,
            toggleFavorite,
            ensureFavoritesLoaded,
            refreshFavorites: loadFavorites,
        }),
        [
            state.status,
            state.items,
            favoriteIds,
            favoriteVehicles,
            state.error,
            isFavorite,
            isPending,
            toggleFavorite,
            ensureFavoritesLoaded,
            loadFavorites,
        ],
    );

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        // Return safe fallback for components tested in isolation without FavoritesProvider
        return {
            status: 'idle',
            items: [],
            favoriteIds: [],
            favoriteVehicles: [],
            favoriteCount: 0,
            error: null,
            isFavorite: () => false,
            isPending: () => false,
            toggleFavorite: () => Promise.resolve({ success: false }),
            ensureFavoritesLoaded: () => Promise.resolve([]),
            refreshFavorites: () => Promise.resolve([]),
        };
    }
    return context;
};
