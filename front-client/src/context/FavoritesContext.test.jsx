import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavoritesProvider, useFavorites } from './FavoritesContext';
import * as favoritesService from '../services/favoritesService';
import * as vehicleService from '../services/vehicleService';

let mockUser = { id: 1, name: 'GUEST1' };
let mockCatalogById = new Map();
const mockUpsertRecord = vi.fn();
const mockGetById = vi.fn((id) => mockCatalogById.get(id));

vi.mock('./UserContext', () => ({
  useUser: () => ({ user: mockUser }),
}));

vi.mock('./VehicleCatalogContext', () => ({
  useVehicleCatalog: () => ({
    byId: mockCatalogById,
    getById: mockGetById,
    upsertRecord: mockUpsertRecord,
  }),
}));

vi.mock('../services/favoritesService', () => ({
  listFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  updateFavoriteComment: vi.fn(),
}));

vi.mock('../services/vehicleService', () => ({
  getVehicle: vi.fn(),
}));

describe('FavoritesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    favoritesService.listFavorites.mockResolvedValue([]);
    favoritesService.addFavorite.mockResolvedValue({});
    favoritesService.removeFavorite.mockResolvedValue(null);
    vehicleService.getVehicle.mockResolvedValue(null);
    mockUser = { id: 1, name: 'GUEST1' };
    mockCatalogById = new Map();
    mockGetById.mockImplementation((id) => mockCatalogById.get(id));
  });

  it('hydrates favorites on mount when user is present and resolves missing vehicles', async () => {
    const favoriteItems = [
      { theblock_id: 'v-1', comment: null, add_date: '2026-10-10' },
      { theblock_id: 'v-2', comment: 'nice', add_date: '2026-10-11' },
    ];
    favoritesService.listFavorites.mockResolvedValueOnce(favoriteItems);

    const vehicle2 = { id: 'v-2', make: 'Ford', model: 'F-150', year: 2023 };
    // v-1 is already in catalog, v-2 is missing
    mockCatalogById.set('v-1', { id: 'v-1', make: 'Honda', model: 'Civic', year: 2022 });
    vehicleService.getVehicle.mockResolvedValueOnce(vehicle2);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.favoriteIds).toEqual(['v-1', 'v-2']);
    expect(result.current.favoriteCount).toBe(2);
    expect(result.current.isFavorite('v-1')).toBe(true);
    expect(result.current.isFavorite('v-3')).toBe(false);

    expect(vehicleService.getVehicle).toHaveBeenCalledWith('v-2', expect.any(Object));
    expect(mockUpsertRecord).toHaveBeenCalledWith(vehicle2);
  });

  it('toggles favorite off by calling removeFavorite', async () => {
    const favoriteItems = [{ theblock_id: 'v-1', comment: null, add_date: '2026-10-10' }];
    favoritesService.listFavorites.mockResolvedValueOnce(favoriteItems);
    favoritesService.removeFavorite.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    let res;
    await act(async () => {
      res = await result.current.toggleFavorite('v-1');
    });

    expect(res.success).toBe(true);
    expect(favoritesService.removeFavorite).toHaveBeenCalledWith('v-1');
    expect(result.current.favoriteIds).toEqual([]);
    expect(result.current.isFavorite('v-1')).toBe(false);
  });

  it('toggles favorite on by calling addFavorite', async () => {
    favoritesService.listFavorites.mockResolvedValueOnce([]);
    favoritesService.addFavorite.mockResolvedValueOnce({
      theblock_id: 'v-3',
      comment: null,
      add_date: '2026-10-11',
    });
    vehicleService.getVehicle.mockResolvedValueOnce({ id: 'v-3', make: 'BMW' });

    const { result } = renderHook(() => useFavorites(), {
      wrapper: ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    let res;
    await act(async () => {
      res = await result.current.toggleFavorite('v-3');
    });

    expect(res.success).toBe(true);
    expect(favoritesService.addFavorite).toHaveBeenCalledWith({ theblockId: 'v-3', comment: undefined });
    expect(result.current.favoriteIds).toEqual(['v-3']);
    expect(result.current.isFavorite('v-3')).toBe(true);
  });

  it('handles server failure gracefully during toggle', async () => {
    favoritesService.listFavorites.mockResolvedValueOnce([]);
    favoritesService.addFavorite.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useFavorites(), {
      wrapper: ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    let res;
    await act(async () => {
      res = await result.current.toggleFavorite('v-4');
    });

    expect(res.success).toBe(false);
    expect(res.error.message).toBe('Server error');
    expect(result.current.favoriteIds).toEqual([]);
  });

  it('resets state when user changes', async () => {
    favoritesService.listFavorites.mockResolvedValueOnce([
      { theblock_id: 'v-1', comment: null, add_date: '2026-10-10' },
    ]);

    const { result, rerender } = renderHook(() => useFavorites(), {
      wrapper: ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      expect(result.current.favoriteIds).toEqual(['v-1']);
    });

    // Switch user
    mockUser = { id: 2, name: 'GUEST2' };
    favoritesService.listFavorites.mockResolvedValueOnce([]);

    rerender();

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual([]);
    });
  });
});
