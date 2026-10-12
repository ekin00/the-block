import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listFavorites, addFavorite, removeFavorite, updateFavoriteComment } from './favoritesService';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('favoritesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listFavorites', () => {
    it('returns array from api.get', async () => {
      const mockItems = [{ theblock_id: 'uuid-1', comment: null, add_date: '2026-10-10T12:00:00' }];
      api.get.mockResolvedValueOnce(mockItems);

      const result = await listFavorites();
      expect(api.get).toHaveBeenCalledWith('/api/favorites', { signal: undefined });
      expect(result).toEqual(mockItems);
    });

    it('returns empty array if response is null/undefined', async () => {
      api.get.mockResolvedValueOnce(null);
      const result = await listFavorites();
      expect(result).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('posts theblock_id and comment when present', async () => {
      api.post.mockResolvedValueOnce({ theblock_id: 'uuid-1', comment: 'favorite car', add_date: '2026-10-10' });
      const result = await addFavorite({ theblockId: 'uuid-1', comment: 'favorite car' });
      expect(api.post).toHaveBeenCalledWith(
        '/api/favorites',
        { theblock_id: 'uuid-1', comment: 'favorite car' },
        { signal: undefined },
      );
      expect(result.theblock_id).toBe('uuid-1');
    });

    it('omits comment when null or undefined', async () => {
      api.post.mockResolvedValueOnce({ theblock_id: 'uuid-2', comment: null, add_date: '2026-10-10' });
      await addFavorite({ theblockId: 'uuid-2' });
      expect(api.post).toHaveBeenCalledWith(
        '/api/favorites',
        { theblock_id: 'uuid-2' },
        { signal: undefined },
      );
    });
  });

  describe('removeFavorite', () => {
    it('calls DELETE on the favorite item endpoint with encoded id', async () => {
      api.delete.mockResolvedValueOnce(null);
      await removeFavorite('uuid/test 1');
      expect(api.delete).toHaveBeenCalledWith('/api/favorites/uuid%2Ftest%201', { signal: undefined });
    });
  });

  describe('updateFavoriteComment', () => {
    it('calls PATCH with comment', async () => {
      api.patch.mockResolvedValueOnce({ theblock_id: 'uuid-1', comment: 'new note' });
      await updateFavoriteComment('uuid-1', 'new note');
      expect(api.patch).toHaveBeenCalledWith('/api/favorites/uuid-1', { comment: 'new note' }, { signal: undefined });
    });
  });
});
