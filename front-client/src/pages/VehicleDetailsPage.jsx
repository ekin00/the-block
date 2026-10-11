import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Skeleton, Stack, Typography } from '@mui/material';
import { useVehicleCatalog } from '../context/VehicleCatalogContext';

/**
 * Phase 1a placeholder: resolves :id against the shared catalog. Direct-load
 * fetch fallback, full specs, auction state and bidding arrive in Phase 1d/1e.
 */
const VehicleDetailsPage = () => {
  const { id } = useParams();
  const { status, getById, ensureLoaded } = useVehicleCatalog();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const vehicle = getById(id);

  return (
    <Box>
      {(status === 'idle' || status === 'loading') && (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={48} />
          <Skeleton variant="rounded" height={320} />
        </Stack>
      )}

      {status === 'ready' && !vehicle && (
        <Alert severity="warning">Vehicle not found.</Alert>
      )}

      {status === 'ready' && vehicle && (
        <>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            VIN {vehicle.vin} · Lot {vehicle.lot}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Full specs, real auction state and bidding are wired in Phases 1d and 1e.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default VehicleDetailsPage;
