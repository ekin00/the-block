import { api } from './api';
import { mapVehicle } from '../features/vehicles/vehicleMapping';

/**
 * Vehicle data access. Every record crossing this boundary passes through
 * `mapVehicle`; backend UUIDs are used everywhere.
 */
export const listVehicles = async ({ signal } = {}) => {
  const data = await api.get('/api/the-block', { signal });
  return (data ?? []).map(mapVehicle).filter(Boolean);
};

export const getVehicle = async (id, { signal } = {}) => {
  const data = await api.get(`/api/the-block/${id}`, { signal });
  return data ? mapVehicle(data) : null;
};
