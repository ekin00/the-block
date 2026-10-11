import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import { useVehicleCatalog } from '../context/VehicleCatalogContext';
import InventorySearchBar from '../components/inventory/InventorySearchBar';
import InventorySidebarFilter from '../components/inventory/InventorySidebarFilter';
import VehicleGrid from '../components/inventory/VehicleGrid';
import VehicleCardList from '../components/inventory/VehicleCardList';
import { useAuctionClock } from '../features/vehicles/useAuctionClock';
import { useInventoryView } from '../features/inventory/useInventoryView';
import { SORTABLE_FIELDS } from '../features/inventory/inventoryView';
import {
  createDefaultFilters,
  DEFAULT_ODOMETER,
  deriveSearchSuggestions,
} from '../features/inventory/inventoryFilters';

const DRAWER_PAPER_SLOT_PROPS = {
  paper: {
    'aria-labelledby': 'inventory-filters-title',
    sx: { width: 'min(360px, 88vw)', display: 'flex', flexDirection: 'column' },
  },
};
const DRAWER_MODAL_PROPS = { keepMounted: true };

const InventoryPage = () => {
  const { status, records, error, ensureLoaded, refresh } = useVehicleCatalog();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const now = useAuctionClock();
  const navigate = useNavigate();
  const view = useInventoryView({ isMobile, records, now, ready: status === 'ready' });
  const { query, update, activeFilterCount } = view;
  const [draft, setDraft] = useState(query);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerViewport, setDrawerViewport] = useState(isMobile);
  if (drawerViewport !== isMobile) {
    setDrawerViewport(isMobile);
    if (!isMobile) setDrawerOpen(false);
  }
  const searchTimer = useRef(null);
  const suggestions = useMemo(
    () => deriveSearchSuggestions(view.activeRows),
    [view.activeRows],
  );

  useEffect(() => {
    setDraft(query);
    clearTimeout(searchTimer.current);
  }, [query]);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const commitSearch = (value = draft) => {
    clearTimeout(searchTimer.current);
    setDraft(value);
    update({ query: value });
  };
  const changeSearch = (value) => {
    clearTimeout(searchTimer.current);
    setDraft(value);
    if (!value) {
      update({ query: '' });
      return;
    }
    searchTimer.current = setTimeout(() => update({ query: value }), 300);
  };
  const clearAll = () => {
    clearTimeout(searchTimer.current);
    setDraft('');
    update({ query: '', filters: createDefaultFilters() });
  };
  const changeFilter = (key, value) => update({ filters: { [key]: value } });
  const resetFilterSection = (key) =>
    update({ filters: { [key]: key === 'odometer' ? [...DEFAULT_ODOMETER] : [] } });

  const hasCriteria = Boolean(query) || activeFilterCount > 0;
  const activeTotal = view.activeRows.length;
  const rendererProps = {
    rows: view.pageRows,
    rowCount: view.rowCount,
    now,
    paginationModel: view.paginationModel,
    onPaginationModelChange: (paginationModel) => update({ paginationModel }),
    onOpenDetails: (vehicle) => navigate(`/vehicles/${encodeURIComponent(vehicle.id)}`),
  };
  const sidebar = (
    <InventorySidebarFilter
      filters={view.filters}
      options={view.filterOptions}
      onFilterChange={changeFilter}
      onResetSection={resetFilterSection}
      onResetAll={clearAll}
    />
  );

  let results;
  if (view.rowCount > 0) {
    results = isMobile ? (
      <VehicleCardList {...rendererProps} />
    ) : (
      <VehicleGrid
        {...rendererProps}
        sortModel={view.sortModel}
        onSortModelChange={(sortModel) => update({ sortModel })}
      />
    );
  } else if (activeTotal === 0) {
    results = (
      <Alert severity="info">No vehicles with valid, unexpired auctions are available.</Alert>
    );
  } else {
    const onlySearch = Boolean(query) && activeFilterCount === 0;
    results = (
      <Alert
        severity="info"
        action={
          onlySearch ? (
            <Button color="inherit" onClick={() => commitSearch('')}>Clear search</Button>
          ) : (
            <Button color="inherit" onClick={clearAll}>Clear all</Button>
          )
        }
      >
        {onlySearch
          ? 'No vehicles match your search.'
          : 'No vehicles match your search and filters.'}
      </Alert>
    );
  }

  const content = (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <InventorySearchBar
        value={draft}
        onChange={changeSearch}
        onSearch={commitSearch}
        suggestions={suggestions}
      />
      {isMobile ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge badgeContent={activeFilterCount} color="primary" overlap="rectangular">
            <Button
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              sx={{ minHeight: 44 }}
            >
              Filters
            </Button>
          </Badge>
          <TextField
            select
            label="Sort inventory"
            value={view.sortModel[0] ? `${view.sortModel[0].field}:${view.sortModel[0].sort}` : ''}
            onChange={(event) => {
              const [field, sort] = event.target.value.split(':');
              update({ sortModel: field ? [{ field, sort }] : [] });
            }}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <MenuItem value="">Soonest ending</MenuItem>
            {SORTABLE_FIELDS.flatMap(({ field, label }) => ['asc', 'desc'].map((sort) => (
              <MenuItem key={`${field}:${sort}`} value={`${field}:${sort}`}>
                {label}, {sort === 'asc' ? 'ascending' : 'descending'}
              </MenuItem>
            )))}
          </TextField>
        </Stack>
      ) : null}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {hasCriteria ? (
          <Chip
            label={`${view.rowCount} of ${activeTotal} shown`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {view.rowCount} vehicles. Soonest-ending auctions first by default.
          </Typography>
        )}
        {hasCriteria ? <Button onClick={clearAll}>Clear all</Button> : null}
        <Button onClick={() => update({ sortModel: [] })}>Reset sorting</Button>
      </Stack>
      {view.dataErrors.length > 0 ? (
        <Alert severity="error">
          Vehicles with invalid auction dates were excluded: {view.dataErrors.map(({ id }) => id ?? 'Unknown ID').join(', ')}.
        </Alert>
      ) : null}
      {results}
    </Stack>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
        Inventory
      </Typography>

      {status === 'idle' || status === 'loading' ? (
        <Stack spacing={1} aria-label="Loading inventory">
          <Skeleton variant="rounded" height={48} />
          <Skeleton variant="rounded" height={320} />
        </Stack>
      ) : null}

      {status === 'error' ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          {error?.message || 'Failed to load vehicles.'}
        </Alert>
      ) : null}

      {status === 'ready' && isMobile ? (
        <>
          {content}
          <Drawer
            anchor="left"
            open={isMobile && drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ModalProps={DRAWER_MODAL_PROPS}
            slotProps={DRAWER_PAPER_SLOT_PROPS}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 1.5 }}
            >
              <Typography id="inventory-filters-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                Filters
              </Typography>
              <IconButton aria-label="Close filters" onClick={() => setDrawerOpen(false)} sx={{ width: 44, height: 44 }}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Divider />
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>{sidebar}</Box>
            <Divider />
            <Box sx={{ p: 1.5 }}>
              <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)} sx={{ minHeight: 44 }}>
                Show {view.rowCount} vehicles
              </Button>
            </Box>
          </Drawer>
        </>
      ) : null}

      {status === 'ready' && !isMobile ? (
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ md: 4, lg: 3 }} component="aside" aria-label="Inventory filters">
            {sidebar}
          </Grid>
          <Grid size={{ md: 8, lg: 9 }} sx={{ minWidth: 0 }}>
            {content}
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default InventoryPage;
