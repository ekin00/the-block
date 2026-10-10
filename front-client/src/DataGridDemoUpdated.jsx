import * as React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';

const rows = [
  {
    id: 'ab69ea7d-1baf-49d1-b9b2-ef6c38b78540',
    vin: 'UMJP9DHX8C2XZJY38',
    make: 'Kia',
    model: 'Telluride',
    year: 2026,
    condition_report:
      'Major mechanical and cosmetic issues present. Not roadworthy in current state. For experienced rebuilders.',
  },
  {
    id: '04ee439e-0ada-4c1f-a9c2-4e70ad5d4dd4',
    vin: '2PLSKYMF5UFTVYEPZ',
    make: 'Volkswagen',
    model: 'Golf GTI',
    year: 2018,
    condition_report:
      'Vehicle shows significant wear. Multiple cosmetic issues noted. Mechanical inspection recommended before purchase.',
  },
  {
    id: 'ddf89062-1b82-4428-8c18-f7406b0300be',
    vin: 'HA562G0V0NWJ01N67',
    make: 'GMC',
    model: 'Terrain',
    year: 2023,
    condition_report:
      'Vehicle is in excellent condition overall. Interior is clean with minimal wear. Exterior shows only minor imperfections consistent with age.',
  },
];

function VehicleGrid({ favorites, toggleFavorite }) {
  const navigate = useNavigate();
  const [menu, setMenu] = React.useState(null);
  // Delay the single-click menu briefly so a second click can be interpreted
  // as a double-click before the menu overlays the grid.
  const clickTimer = React.useRef(null);

  React.useEffect(() => () => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
  }, []);

  const selectedVehicle = menu
    ? rows.find((row) => row.id === menu.vehicleId)
    : null;

  const columns = React.useMemo(
    () => [
      { field: 'vin', headerName: 'VIN', minWidth: 200, flex: 1 },
      { field: 'make', headerName: 'Make', width: 140 },
      {
        field: 'model',
        headerName: 'Model',
        width: 160,
        renderCell: (params) => (
          <Tooltip title={params.row.condition_report || 'No report available'} arrow>
            <span style={{ cursor: 'pointer' }}>{params.value}</span>
          </Tooltip>
        ),
      },
      { field: 'year', headerName: 'Year', type: 'number', width: 100 },
      {
        field: 'favorite',
        headerName: 'Favorite',
        width: 110,
        sortable: false,
        renderCell: (params) =>
          favorites.includes(params.row.id) ? (
            <Chip size="small" color="error" label="Saved" icon={<FavoriteIcon />} />
          ) : (
            <Typography variant="body2" color="text.secondary">—</Typography>
          ),
      },
    ],
    [favorites],
  );

  return (
    <>
      <Paper variant="outlined" sx={{ height: 430, width: '100%', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          onRowClick={(params, event) => {
            // Wait a moment before showing the menu, so double-click can win.
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
            navigate(`/vehicles/${params.row.id}`);
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' },
          }}
        />
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Tip: single-click a row for actions; double-click to open vehicle details.
      </Typography>

      <Menu
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          menu ? { top: menu.mouseY, left: menu.mouseX } : undefined
        }
        slotProps={{ paper: { sx: { minWidth: 210 } } }}
      >
        {selectedVehicle
          ? [
              <MenuItem
                key="favorite"
                onClick={() => {
                  toggleFavorite(selectedVehicle.id);
                  setMenu(null);
                }}
              >
                <ListItemIcon>
                  {favorites.includes(selectedVehicle.id) ? (
                    <FavoriteIcon fontSize="small" color="error" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {favorites.includes(selectedVehicle.id)
                    ? 'Remove Favorite'
                    : 'Save Favorite'}
                </ListItemText>
              </MenuItem>,
              <MenuItem
                key="details"
                onClick={() => {
                  navigate(`/vehicles/${selectedVehicle.id}`);
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
}

function HomePage({ favorites, toggleFavorite }) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Vehicle inventory</Typography>
        <Typography color="text.secondary">
          Browse mock listings and use the row actions to save favorites or inspect a vehicle.
        </Typography>
      </Stack>
      <VehicleGrid favorites={favorites} toggleFavorite={toggleFavorite} />
    </Container>
  );
}

function FavoritesPage({ favorites, toggleFavorite }) {
  const favoriteRows = rows.filter((row) => favorites.includes(row.id));
  const navigate = useNavigate();

  const columns = [
    { field: 'vin', headerName: 'VIN', minWidth: 200, flex: 1 },
    { field: 'make', headerName: 'Make', width: 140 },
    { field: 'model', headerName: 'Model', width: 160 },
    { field: 'year', headerName: 'Year', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 210,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => navigate(`/vehicles/${params.row.id}`)}>
            Details
          </Button>
          <Button size="small" color="error" onClick={() => toggleFavorite(params.row.id)}>
            Remove
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Favorites</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your saved vehicles. The count in the navigation updates immediately.
      </Typography>
      {favoriteRows.length ? (
        <Paper variant="outlined" sx={{ height: 380 }}>
          <DataGrid
            rows={favoriteRows}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
          />
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <FavoriteBorderIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h6">No favorites yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Return to the inventory and save a vehicle from its row menu.
          </Typography>
          <Button component={Link} to="/" variant="contained">Browse vehicles</Button>
        </Paper>
      )}
    </Container>
  );
}

function DetailsPage({ favorites, toggleFavorite }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle = rows.find((row) => row.id === id);
  const isFavorite = favorites.includes(id);

  if (!vehicle) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Vehicle not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>Back to inventory</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">Vehicle details</Typography>
            <Typography variant="h4" fontWeight={700}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>VIN: {vehicle.vin}</Typography>
          </Box>
          <Button
            variant={isFavorite ? 'outlined' : 'contained'}
            color={isFavorite ? 'error' : 'primary'}
            startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={() => toggleFavorite(vehicle.id)}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            {isFavorite ? 'Remove Favorite' : 'Save Favorite'}
          </Button>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Condition report</Typography>
        <Typography sx={{ lineHeight: 1.8 }}>{vehicle.condition_report}</Typography>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Make: ${vehicle.make}`} />
          <Chip label={`Model: ${vehicle.model}`} />
          <Chip label={`Year: ${vehicle.year}`} />
        </Stack>
      </Paper>
    </Container>
  );
}

function AppLayout() {
  const [favorites, setFavorites] = React.useState([]);
  const location = useLocation();

  const toggleFavorite = React.useCallback((vehicleId) => {
    setFavorites((current) =>
      current.includes(vehicleId)
        ? current.filter((id) => id !== vehicleId)
        : [...current, vehicleId],
    );
  }, []);

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 2 }}>
          <Typography component={Link} to="/" variant="h6" color="text.primary"
            sx={{ textDecoration: 'none', fontWeight: 800, mr: 'auto' }}>
            AutoLot Demo
          </Typography>
          <Button component={Link} to="/" color={location.pathname === '/' ? 'primary' : 'inherit'}>
            Inventory
          </Button>
          <Button
            component={Link}
            to="/favorites"
            color={location.pathname === '/favorites' ? 'primary' : 'inherit'}
            startIcon={<FavoriteIcon />}
          >
            Favorites ({favorites.length})
          </Button>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<HomePage favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/favorites" element={<FavoritesPage favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/vehicles/:id" element={<DetailsPage favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="*" element={<Container sx={{ py: 4 }}><Typography>Page not found.</Typography><Button component={Link} to="/">Go home</Button></Container>} />
      </Routes>
    </>
  );
}

export default function DataGridDemo() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
