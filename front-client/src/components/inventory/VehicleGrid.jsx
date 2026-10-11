/* eslint-disable react/prop-types */
import * as React from 'react';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CompareIcon from '@mui/icons-material/Compare';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import AuctionEndChip from './AuctionEndChip';

// Local copy of the compare limit for UX copy only; the backend maximum is
// enforced server-side once compare is wired in Phase 3.
const MAX_COMPARE = 3;
const PAGE_SIZE_OPTIONS = [5, 10, 25];
const VEHICLE_TEXT_SX = { fontWeight: 600, fontVariantNumeric: 'tabular-nums' };

function FavoriteCell({ vehicleId, favoriteIds, onToggleFavorite }) {
  const isFavorite = favoriteIds.includes(vehicleId);
  const label = !onToggleFavorite ? 'Favorites arrive in Phase 2' : isFavorite ? 'Remove favorite' : 'Add to favorites';
  const theme = useTheme();

  return (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          disabled={!onToggleFavorite}
          onClick={(event) => {
            // Handle this action immediately instead of opening the row menu.
            event.stopPropagation();
            onToggleFavorite?.(vehicleId);
          }}
          onDoubleClick={(event) => event.stopPropagation()}
          sx={{
            width: 34,
            height: 34,
            color: isFavorite ? theme.palette.error.main : 'text.secondary',
            border: '1px solid',
            borderColor: isFavorite ? theme.palette.error.light : 'divider',
            borderRadius: 1.5,
            bgcolor: isFavorite ? theme.palette.error.light + '14' : 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: isFavorite ? theme.palette.error.light + '29' : 'action.hover',
              borderColor: isFavorite ? theme.palette.error.main : 'text.secondary',
            },
          }}
        >
          {isFavorite ? (
            <FavoriteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function CompareCell({ vehicleId, compareIds, onToggleCompare }) {
  const isCompared = compareIds.includes(vehicleId);
  const limitReached = !isCompared && compareIds.length >= MAX_COMPARE;
  const label = !onToggleCompare ? 'Compare arrives in Phase 3' : isCompared ? 'Remove from comparison' : 'Add to comparison';
  const theme = useTheme();

  return (
    <Tooltip
      title={limitReached ? `You can compare up to ${MAX_COMPARE} vehicles` : label}
      arrow
    >
      <span>
        <IconButton
          size="small"
          aria-label={label}
          disabled={!onToggleCompare || limitReached}
          onClick={(event) => {
            event.stopPropagation();
            onToggleCompare?.(vehicleId);
          }}
          onDoubleClick={(event) => event.stopPropagation()}
          sx={{
            width: 34,
            height: 34,
            border: '1px solid',
            borderColor: isCompared ? 'primary.main' : 'divider',
            borderRadius: 1.5,
            color: isCompared ? 'primary.main' : 'text.secondary',
            bgcolor: isCompared ? theme.palette.primary.main + '14' : 'transparent',
            fontWeight: 800,
            fontSize: '1rem',
            lineHeight: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: isCompared ? theme.palette.primary.main + '29' : 'action.hover',
              borderColor: isCompared ? 'primary.dark' : 'text.secondary',
            },
          }}
        >
          {isCompared ? <CompareIcon fontSize="small" /> : <CompareArrowsIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

/**
 * Shared production vehicle grid. Presentational only: the page owns
 * sorting, pagination, filtering and navigation. `rows` is the current page
 * slice; the grid runs in server sorting/pagination mode and only draws
 * header arrows and the pager.
 */
const VehicleGrid = ({
  rows = [],
  rowCount,
  loading = false,
  now = new Date(),
  userId,
  showFavorite = false,
  onOpenDetails,
  onToggleFavorite,
  onToggleCompare,
  favoriteIds = [],
  compareIds = [],
  sortModel = [],
  onSortModelChange,
  paginationModel = { page: 0, pageSize: 5 },
  onPaginationModelChange,
}) => {
  const [menu, setMenu] = React.useState(null);
  // Keep the short delay for ordinary row clicks so a double-click can open details.
  // Favorite and Compare cell clicks stop propagation and do not open this menu.
  const clickTimer = React.useRef(null);

  React.useEffect(
    () => () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    },
    [],
  );

  const openDetails = React.useCallback(
    (vehicle) => {
      if (vehicle && onOpenDetails) onOpenDetails(vehicle);
    },
    [onOpenDetails],
  );

  const selectedVehicle = menu ? rows.find((row) => row.id === menu.vehicleId) : null;

  const columns = React.useMemo(
    () => [
      {
        field: 'compareAction',
        headerName: 'CF',
        width: 60,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <CompareCell
            vehicleId={params.row.id}
            compareIds={compareIds}
            onToggleCompare={onToggleCompare}
          />
        ),
      },
      {
        field: 'year',
        headerName: 'Year',
        type: 'number',
        valueFormatter: (value) => value == null ? '' : String(value),
        width: 70,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={VEHICLE_TEXT_SX}>{params.formattedValue}</Typography>
        ),
      },
      {
        field: 'make',
        headerName: 'Make',
        width: 110,
        renderCell: (params) => (
          <Typography variant="body2" sx={VEHICLE_TEXT_SX}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'model',
        headerName: 'Model',
        minWidth: 110,
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body2" sx={VEHICLE_TEXT_SX}>{params.value}</Typography>
        ),
      },
      {
        field: 'trim',
        headerName: 'Trim',
        width: 100,
        renderCell: (params) => (
          <Typography variant="body2" sx={VEHICLE_TEXT_SX}>{params.value || 'N/A'}</Typography>
        ),
      },
      {
        field: 'odometer_mi',
        headerName: 'Odometer',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const miles = params.row.odometer_mi;
          return (
            <Tooltip title={params.row.condition_report || 'No report available'} arrow>
              <Typography variant="body2" sx={VEHICLE_TEXT_SX}>
                {Number.isFinite(miles) ? `${miles.toLocaleString()} mi` : '—'}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        field: 'auction_end',
        headerName: 'Time left',
        width: 140,
        renderCell: (params) => (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', height: '100%' }}>
            <AuctionEndChip vehicle={params.row} now={now} />
          </Box>
        ),
      },
      {
        field: 'current_bid',
        headerName: 'Current Bid',
        width: 110,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const bid = params.row.current_bid ?? params.row.starting_bid;
          const isHighBidder = Boolean(
            (userId != null && params.row.current_winner_id != null
              && String(params.row.current_winner_id) === String(userId))
            || params.row.is_winner
          );
          return (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                width: '100%',
              }}
            >
              {isHighBidder && (
                <Tooltip title="You are the high bidder" arrow>
                  <CheckCircleOutlineIcon
                    data-testid="high-bidder-icon"
                    sx={{ fontSize: '1rem', color: 'success.main', flexShrink: 0 }}
                  />
                </Tooltip>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: isHighBidder ? 'success.main' : 'common.black',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {bid != null ? `$${bid.toLocaleString()}` : '—'}
              </Typography>
            </Box>
          );
        },
      },
      ...(showFavorite
        ? [
            {
              field: 'favorite',
              headerName: 'Favorite',
              width: 95,
              sortable: false,
              filterable: false,
              align: 'center',
              headerAlign: 'center',
              renderCell: (params) => (
                <FavoriteCell
                  vehicleId={params.row.id}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                />
              ),
            },
          ]
        : []),
    ],
    [compareIds, favoriteIds, now, onToggleCompare, onToggleFavorite, showFavorite, userId],
  );

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          borderColor: 'divider',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount ?? rows.length}
          loading={loading}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onCellKeyDown={(params, event) => {
            if (event.key === 'Enter' && params.field !== 'favorite' && params.field !== 'compareAction') {
              event.preventDefault();
              if (clickTimer.current) {
                clearTimeout(clickTimer.current);
                clickTimer.current = null;
              }
              setMenu(null);
              openDetails(params.row);
            }
          }}
          onRowClick={(params, event) => {
            if (clickTimer.current) clearTimeout(clickTimer.current);
            const clickPosition = {
              vehicleId: params.row.id,
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            };
            clickTimer.current = setTimeout(() => {
              setMenu(clickPosition);
              clickTimer.current = null;
            }, 250);
          }}
          onRowDoubleClick={(params) => {
            if (clickTimer.current) {
              clearTimeout(clickTimer.current);
              clickTimer.current = null;
            }
            setMenu(null);
            openDetails(params.row);
          }}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider',
              fontWeight: 700,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.85rem',
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 85, 229, 0.04)',
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'divider',
            },
          }}
        />
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Click a row and choose See Details, double-click a row, or press Enter on a vehicle cell to open details.
        {!onToggleFavorite && !onToggleCompare ? ' Favorites and Compare are coming in later phases.' : ''}
      </Typography>

      <Menu
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={menu ? { top: menu.mouseY, left: menu.mouseX } : undefined}
        slotProps={{ paper: { sx: { minWidth: 210, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } }}
      >
        {selectedVehicle
          ? [
            <MenuItem
              key="favorite"
              disabled={!onToggleFavorite}
              onClick={() => {
                onToggleFavorite?.(selectedVehicle.id);
                setMenu(null);
              }}
            >
              <ListItemIcon>
                {favoriteIds.includes(selectedVehicle.id) ? (
                  <FavoriteIcon fontSize="small" sx={{ color: 'error.main' }} />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {favoriteIds.includes(selectedVehicle.id) ? 'Remove Favorite' : 'Save Favorite'}
              </ListItemText>
            </MenuItem>,
            <MenuItem
              key="details"
              onClick={() => {
                openDetails(selectedVehicle);
                setMenu(null);
              }}
            >
              <ListItemText inset>See Details</ListItemText>
            </MenuItem>,
          ]
          : []}
      </Menu>
    </>
  );
};

export default VehicleGrid;
