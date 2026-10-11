/* eslint-disable react/prop-types */
import { Stack, TablePagination } from '@mui/material';
import VehicleCard from './VehicleCard';
import { PAGE_SIZES } from '../../features/inventory/inventoryView';

/**
 * Mobile renderer for the inventory page slice. Receives the same records
 * and callbacks as VehicleGrid; it owns no filtering, sorting, or paging.
 */
const VehicleCardList = ({
  rows = [],
  rowCount = rows.length,
  paginationModel = { page: 0, pageSize: 10 },
  onPaginationModelChange,
  now,
  onOpenDetails,
  favoriteIds = [],
  compareIds = [],
  onToggleFavorite,
  onToggleCompare,
}) => (
  <Stack spacing={2}>
    {rows.map((vehicle) => (
      <VehicleCard
        key={vehicle.id}
        vehicle={vehicle}
        now={now}
        onOpenDetails={onOpenDetails}
        isFavorite={favoriteIds.includes(vehicle.id)}
        isCompared={compareIds.includes(vehicle.id)}
        onToggleFavorite={onToggleFavorite}
        onToggleCompare={onToggleCompare}
      />
    ))}
    <TablePagination
      component="div"
      count={rowCount}
      page={paginationModel.page}
      rowsPerPage={paginationModel.pageSize}
      rowsPerPageOptions={PAGE_SIZES}
      onPageChange={(_, page) => onPaginationModelChange?.({ ...paginationModel, page })}
      onRowsPerPageChange={(event) => onPaginationModelChange?.({ page: 0, pageSize: Number(event.target.value) })}
      sx={{ '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', px: 0 } }}
    />
  </Stack>
);

export default VehicleCardList;
