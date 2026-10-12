import { api } from './api';

/**
 * Favorites tracking access. All calls require a valid numeric X-User-Id
 * header, injected automatically by `api.jsx` from current user state.
 */
export const listFavorites = async ({ signal } = {}) => {
  const data = await api.get('/api/favorites', { signal });
  return Array.isArray(data) ? data : [];
};

export const addFavorite = ({ theblockId, comment }, { signal } = {}) =>
  api.post(
    '/api/favorites',
    {
      theblock_id: theblockId,
      ...(comment !== undefined && comment !== null ? { comment } : {}),
    },
    { signal },
  );

export const removeFavorite = (theblockId, { signal } = {}) =>
  api.delete(`/api/favorites/${encodeURIComponent(theblockId)}`, { signal });

export const updateFavoriteComment = (theblockId, comment, { signal } = {}) =>
  api.patch(
    `/api/favorites/${encodeURIComponent(theblockId)}`,
    { comment },
    { signal },
  );
