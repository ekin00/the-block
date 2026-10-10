/* eslint-disable react/prop-types */
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
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CompareIcon from '@mui/icons-material/Compare';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { DataGrid } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

const MAX_COMPARE = 3;

const rows = [
  {
    id: 'ab69ea7d-1baf-49d1-b9b2-ef6c38b78540',
    vin: 'UMJP9DHX8C2XZJY38',
    make: 'Kia',
    model: 'Telluride',
    year: 2026,
    body_style: 'SUV',
    engine: '3.8L V6 GDI',
    drivetrain: 'AWD',
    transmission: '8-Speed Automatic',
    mileage: '14,200 mi',
    exterior_color: 'Dark Moss',
    interior_color: 'Black Leather',
    title_status: 'Clean (ON)',
    location: 'Mississauga, ON',
    seller: 'Apex Fleet Sales',
    seller_type: 'Dealer',
    comments_count: 18,
    condition_grade: 1.3,
    condition_report:
      'Major mechanical and cosmetic issues present. Not roadworthy in current state. For experienced rebuilders.',
    auction_start: '2026-10-04T11:00:00',
    auction_end: '2026-10-11T15:00:00',
    starting_bid: 8000,
    reserve_price: 14000,
    buy_now_price: 18000,
    current_bid: 9500,
    bid_count: 4,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2026+Kia+Telluride+Front+View',
      'https://placehold.co/800x600/1e293b/eaeaea?text=2026+Kia+Telluride+Side+Profile',
      'https://placehold.co/800x600/0f172a/eaeaea?text=2026+Kia+Telluride+Interior',
      'https://placehold.co/800x600/334155/eaeaea?text=2026+Kia+Telluride+Dashboard'
    ],
  },
  {
    id: '04ee439e-0ada-4c1f-a9c2-4e70ad5d4dd4',
    vin: '2PLSKYMF5UFTVYEPZ',
    make: 'Volkswagen',
    model: 'Golf GTI',
    year: 2018,
    body_style: 'Hatchback',
    engine: '2.0L Turbocharged TSI I4',
    drivetrain: 'FWD',
    transmission: '6-Speed Manual',
    mileage: '58,300 mi',
    exterior_color: 'Tornado Red',
    interior_color: 'Titan Black Tartan',
    title_status: 'Clean (NY)',
    location: 'Farmingville, NY 11738',
    seller: 'Paul_V',
    seller_type: 'Private Party',
    comments_count: 41,
    condition_grade: 2.7,
    condition_report:
      'Vehicle shows significant wear. Multiple cosmetic issues noted. Mechanical inspection recommended before purchase.',
    auction_start: '2026-10-05T11:00:00',
    auction_end: '2026-10-12T12:36:00',
    starting_bid: 11000,
    reserve_price: 15000,
    buy_now_price: null,
    current_bid: 16500,
    bid_count: 19,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2018+VW+Golf+GTI+Front',
      'https://placehold.co/800x600/1e293b/eaeaea?text=2018+VW+Golf+GTI+Rear',
      'https://placehold.co/800x600/0f172a/eaeaea?text=2018+VW+Golf+GTI+Cockpit',
      'https://placehold.co/800x600/334155/eaeaea?text=2018+VW+Golf+GTI+Engine+Bay'
    ],
  },
  {
    id: 'ddf89062-1b82-4428-8c18-f7406b0300be',
    vin: 'HA562G0V0NWJ01N67',
    make: 'GMC',
    model: 'Terrain',
    year: 2023,
    body_style: 'SUV',
    engine: '1.5L Turbo 4-Cylinder',
    drivetrain: 'AWD',
    transmission: '9-Speed Automatic',
    mileage: '18,900 mi',
    exterior_color: 'Ebony Twilight Metallic',
    interior_color: 'Jet Black',
    title_status: 'Clean (ON)',
    location: 'Toronto, ON',
    seller: 'NorthStar Fleet',
    seller_type: 'Dealer',
    comments_count: 36,
    condition_grade: 4.3,
    condition_report:
      'Vehicle is in excellent condition overall. Interior is clean with minimal wear. Exterior shows only minor imperfections consistent with age.',
    auction_start: '2026-10-03T11:00:00',
    auction_end: '2026-10-11T15:00:00',
    starting_bid: 17000,
    reserve_price: null,
    buy_now_price: 33000,
    current_bid: 32500,
    bid_count: 22,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2023+GMC+Terrain+Front+Quarter',
      'https://placehold.co/800x600/1e293b/eaeaea?text=2023+GMC+Terrain+Interior',
      'https://placehold.co/800x600/0f172a/eaeaea?text=2023+GMC+Terrain+Wheels',
      'https://placehold.co/800x600/334155/eaeaea?text=2023+GMC+Terrain+Rear'
    ],
  },
  {
    id: 'c77b4548-320b-4924-a097-f68052fdc454',
    vin: 'AHZ4JN6B491XFVSU9',
    make: 'Kia',
    model: 'Forte',
    year: 2024,
    body_style: 'Sedan',
    engine: '2.0L MPI 4-Cylinder',
    drivetrain: 'FWD',
    transmission: 'Intelligent Variable (IVT)',
    mileage: '8,400 mi',
    exterior_color: 'Gravity Grey',
    interior_color: 'Black Cloth',
    title_status: 'Clean (QC)',
    location: 'Montreal, QC',
    seller: 'Metro Auto Wholesale',
    seller_type: 'Dealer',
    comments_count: 14,
    condition_grade: 3.9,
    condition_report:
      'Average condition. Has some visible wear on high-touch surfaces. Engine and transmission perform within normal parameters.',
    auction_start: '2026-10-03T11:00:00',
    auction_end: '2026-10-12T15:00:00',
    starting_bid: 13500,
    reserve_price: 20500,
    buy_now_price: null,
    current_bid: 17250,
    bid_count: 8,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2024+Kia+Forte+Exterior',
      'https://placehold.co/800x600/1e293b/eaeaea?text=2024+Kia+Forte+Cabin',
      'https://placehold.co/800x600/0f172a/eaeaea?text=2024+Kia+Forte+Instrument+Cluster'
    ],
  }
];

function FavoriteCell({ vehicleId, favorites, toggleFavorite }) {
  const isFavorite = favorites.includes(vehicleId);
  const theme = useTheme();

  return (
    <Tooltip title={isFavorite ? 'Remove favorite' : 'Add to favorites'} arrow>
      <IconButton
        size="small"
        aria-label={isFavorite ? 'Remove favorite' : 'Add to favorites'}
        onClick={(event) => {
          // Handle this action immediately instead of opening the row menu.
          event.stopPropagation();
          toggleFavorite(vehicleId);
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
    </Tooltip>
  );
}

function CompareCell({ vehicleId, compare, toggleCompare }) {
  const isCompared = compare.includes(vehicleId);
  const limitReached = !isCompared && compare.length >= MAX_COMPARE;
  const label = isCompared ? 'Remove from comparison' : 'Add to comparison';
  const theme = useTheme();

  return (
    <Tooltip
      title={limitReached ? `You can compare up to ${MAX_COMPARE} vehicles` : label}
      arrow
    >
      <IconButton
        size="small"
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          toggleCompare(vehicleId);
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
    </Tooltip>
  );
}

function VehicleGrid({ favorites, toggleFavorite, compare, toggleCompare, base }) {
  const navigate = useNavigate();
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

  const selectedVehicle = menu ? rows.find((row) => row.id === menu.vehicleId) : null;

  const columns = React.useMemo(
    () => [
      {
        field: 'compareAction',
        headerName: 'Compare',
        width: 100,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <CompareCell
            vehicleId={params.row.id}
            compare={compare}
            toggleCompare={toggleCompare}
          />
        ),
      },
      { field: 'make', headerName: 'Make', width: 150 },
      {
        field: 'model',
        headerName: 'Model',
        minWidth: 170,
        flex: 1,
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
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <FavoriteCell
            vehicleId={params.row.id}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        ),
      },
    ],
    [compare, favorites, toggleCompare, toggleFavorite],
  );

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          height: 430,
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
            navigate(`${base}/vehicles/${params.row.id}`);
          }}
          initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
          pageSizeOptions={[5, 10, 25]}
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
        Click the heart to toggle Favorite, or click the compare icon to add/remove a vehicle from Compare (maximum {MAX_COMPARE}).
        Double-click elsewhere in a row to open vehicle details.
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
                onClick={() => {
                  toggleFavorite(selectedVehicle.id);
                  setMenu(null);
                }}
              >
                <ListItemIcon>
                  {favorites.includes(selectedVehicle.id) ? (
                    <FavoriteIcon fontSize="small" sx={{ color: 'error.main' }} />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {favorites.includes(selectedVehicle.id) ? 'Remove Favorite' : 'Save Favorite'}
                </ListItemText>
              </MenuItem>,
              <MenuItem
                key="details"
                onClick={() => {
                  navigate(`${base}/vehicles/${selectedVehicle.id}`);
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

function HomePage({ favorites, toggleFavorite, compare, toggleCompare, base }) {
  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
          Vehicle inventory
        </Typography>
        <Typography color="text.secondary">
          Browse mock listings. Favorite and Compare can both be toggled directly in their columns.
        </Typography>
      </Stack>
      <VehicleGrid
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        compare={compare}
        toggleCompare={toggleCompare}
        base={base}
      />
    </Box>
  );
}

function FavoritesPage({ favorites, toggleFavorite, base }) {
  const favoriteRows = rows.filter((row) => favorites.includes(row.id));
  const navigate = useNavigate();

  const columns = [
    { field: 'make', headerName: 'Make', width: 150 },
    { field: 'model', headerName: 'Model', minWidth: 170, flex: 1 },
    { field: 'year', headerName: 'Year', type: 'number', width: 100 },
    { field: 'vin', headerName: 'VIN', minWidth: 190, flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 210,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`${base}/vehicles/${params.row.id}`)}
            sx={{ borderRadius: 1.5, textTransform: 'none' }}
          >
            Details
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => toggleFavorite(params.row.id)}
            sx={{ borderRadius: 1.5, textTransform: 'none' }}
          >
            Remove
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
        Favorites
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your saved vehicles. The count in the navigation updates immediately.
      </Typography>
      {favoriteRows.length ? (
        <Paper
          variant="outlined"
          sx={{
            height: 380,
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <DataGrid
            rows={favoriteRows}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontWeight: 700,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 85, 229, 0.04)',
              },
            }}
          />
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 2, borderColor: 'divider' }}>
          <FavoriteBorderIcon sx={{ fontSize: 48, mb: 1.5, color: 'text.disabled' }} />
          <Typography variant="h6" fontWeight={600}>No favorites yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Return to the inventory and click a heart in the Favorite column.
          </Typography>
          <Button component={Link} to={base || '/'} variant="contained" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
            Browse vehicles
          </Button>
        </Paper>
      )}
    </Box>
  );
}

function ComparePage({ compare, toggleCompare, base }) {
  const comparedRows = rows.filter((row) => compare.includes(row.id));
  const navigate = useNavigate();

  const columns = [
    {
      field: 'compareAction',
      headerName: 'Compare',
      width: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CompareCell vehicleId={params.row.id} compare={compare} toggleCompare={toggleCompare} />
      ),
    },
    { field: 'make', headerName: 'Make', width: 150 },
    { field: 'model', headerName: 'Model', minWidth: 170, flex: 1 },
    { field: 'year', headerName: 'Year', type: 'number', width: 100 },
    {
      field: 'details',
      headerName: 'Details',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`${base}/vehicles/${params.row.id}`)}
          sx={{ borderRadius: 1.5, textTransform: 'none' }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
            Compare vehicles
          </Typography>
          <Typography color="text.secondary">
            Select up to {MAX_COMPARE} vehicles. Click the compare icon in the Compare column to remove one.
          </Typography>
        </Box>
        <Chip
          icon={<CompareArrowsIcon />}
          label={`${comparedRows.length} of ${MAX_COMPARE} selected`}
          color={comparedRows.length === MAX_COMPARE ? 'primary' : 'default'}
          variant="outlined"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 600 }}
        />
      </Stack>
      {comparedRows.length ? (
        <Paper
          variant="outlined"
          sx={{
            height: 380,
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <DataGrid
            rows={comparedRows}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontWeight: 700,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 85, 229, 0.04)',
              },
            }}
          />
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 2, borderColor: 'divider' }}>
          <CompareArrowsIcon sx={{ fontSize: 48, mb: 1.5, color: 'text.disabled' }} />
          <Typography variant="h6" fontWeight={600}>No vehicles to compare yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Return to the inventory and click the compare icon in the Compare column for up to three vehicles.
          </Typography>
          <Button component={Link} to={base || '/'} variant="contained" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
            Browse vehicles
          </Button>
        </Paper>
      )}
    </Box>
  );
}

function DetailsPage({ favorites, toggleFavorite, base }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle = rows.find((row) => row.id === id);
  const isFavorite = favorites.includes(id);

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [currentBid, setCurrentBid] = React.useState(
    vehicle ? vehicle.current_bid || vehicle.starting_bid : 0,
  );
  const [bidCount, setBidCount] = React.useState(vehicle ? vehicle.bid_count || 0 : 0);
  const [bidDialogOpen, setBidDialogOpen] = React.useState(false);
  const [bidInput, setBidInput] = React.useState(
    vehicle ? (vehicle.current_bid || vehicle.starting_bid) + 250 : 1000,
  );
  const [bidSuccessNotice, setBidSuccessNotice] = React.useState('');

  if (!vehicle) {
    return (
      <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Vehicle not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(base || '/')} sx={{ textTransform: 'none' }}>
          Back to inventory
        </Button>
      </Box>
    );
  }

  const images = vehicle.images && vehicle.images.length ? vehicle.images : [
    `https://placehold.co/800x600/1a1a2e/eaeaea?text=${vehicle.year}+${vehicle.make}+${vehicle.model}`,
  ];

  const handleOpenBidDialog = () => {
    setBidInput(currentBid + 250);
    setBidDialogOpen(true);
  };

  const handleConfirmBid = () => {
    if (bidInput > currentBid) {
      setCurrentBid(bidInput);
      setBidCount((prev) => prev + 1);
      setBidDialogOpen(false);
      setBidSuccessNotice(`Bid of $${bidInput.toLocaleString()} placed successfully!`);
    }
  };

  // Format auction end date
  const formatEndDate = (dateStr) => {
    if (!dateStr) return 'Ending soon';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Box sx={{ width: '100%', py: { xs: 1.5, sm: 2.5 } }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
          textTransform: 'none',
          fontWeight: 600,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
        }}
      >
        Back to inventory
      </Button>

      {/* Sticky Auction Header Bar (Integrated Theme & Muted Tones) */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: { xs: 56, sm: 64 },
          zIndex: 100,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRadius: 2,
          p: { xs: 1.5, sm: 1.75 },
          mb: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2.5 },
        }}
      >
        {/* Left Auction Indicators & Top Pricing Summary */}
        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 2.5 }}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          {/* Time Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>
                Time Left
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                2 Days
              </Typography>
            </Box>
          </Box>

          {/* High Bid */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 19 }} />
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>
                High Bid
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary' }}>
                ${currentBid.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* # Bids */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.9rem' }}>#</Typography>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>
                Bids
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                {bidCount}
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, my: 0.5 }} />

          {/* Starting Bid */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>
                Starting Bid
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.primary' }}>
                ${vehicle.starting_bid.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Reserve Status */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>
                Reserve
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: vehicle.reserve_price ? 'text.primary' : 'success.main' }}>
                {vehicle.reserve_price ? `$${vehicle.reserve_price.toLocaleString()}` : 'No Reserve'}
              </Typography>
            </Box>
          </Box>

          {/* Auction End Date */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>
                Auction Ends
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                {formatEndDate(vehicle.auction_end)}
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Right Auction Actions: Save Favorite, Buy Now & Place Bid */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Save Favorite Button */}
          <Button
            variant={isFavorite ? 'contained' : 'outlined'}
            onClick={() => toggleFavorite(vehicle.id)}
            startIcon={
              isFavorite ? (
                <FavoriteIcon sx={{ color: '#FFFFFF', fontSize: '1.1rem' }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              )
            }
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 0.8,
              transition: 'all 0.2s ease',
              ...(isFavorite
                ? {
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    borderColor: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.dark',
                      borderColor: 'error.dark',
                    },
                  }
                : {
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: 'text.primary',
                      borderColor: 'text.secondary',
                    },
                  }),
            }}
          >
            {isFavorite ? 'Favorited' : 'Save Favorite'}
          </Button>

          {/* Place Bid Button in Brand Blue */}
          <Button
            variant="contained"
            onClick={handleOpenBidDialog}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 700,
              fontSize: '0.925rem',
              px: 2.25,
              py: 0.8,
              borderRadius: 1.5,
              boxShadow: '0 4px 12px rgba(0, 85, 229, 0.15)',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 6px 16px rgba(0, 85, 229, 0.25)',
              },
            }}
          >
            Place Bid
          </Button>
        </Stack>
      </Paper>

      {/* Two-Column Layout: Left Images, Right Specs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Column: Vehicle Image Gallery */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderColor: 'divider',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              bgcolor: 'background.paper',
            }}
          >
            {/* Featured Image */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 260, sm: 360 },
                borderRadius: 1.5,
                overflow: 'hidden',
                bgcolor: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={images[activeImageIndex]}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'opacity 0.25s ease',
                }}
              />

              {/* Photo Index Indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 1,
                }}
              >
                {activeImageIndex + 1} / {images.length}
              </Box>

              {/* Condition Grade Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  bgcolor:
                    vehicle.condition_grade >= 4.0
                      ? 'rgba(22, 101, 52, 0.9)'
                      : vehicle.condition_grade >= 2.5
                      ? 'rgba(180, 83, 9, 0.9)'
                      : 'rgba(185, 28, 28, 0.9)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <VerifiedUserIcon sx={{ fontSize: 14 }} />
                Grade {vehicle.condition_grade} / 5.0
              </Box>
            </Box>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <Stack direction="row" spacing={1.25} sx={{ mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
                {images.map((imgSrc, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    component="img"
                    src={imgSrc}
                    alt={`Thumbnail ${idx + 1}`}
                    sx={{
                      width: 76,
                      height: 54,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: activeImageIndex === idx ? 'primary.main' : 'transparent',
                      opacity: activeImageIndex === idx ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                      '&:hover': { opacity: 1 },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Vehicle Auction Specifications Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 2,
              borderColor: 'divider',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ letterSpacing: '-0.02em', color: 'text.primary', mb: 0.5 }}
              >
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: 'monospace', mb: 2 }}
              >
                VIN: {vehicle.vin}
              </Typography>

              {/* 2-Column Clean Key-Value Table matching reference */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  columnGap: 2.5,
                  rowGap: 1.25,
                  mt: 1,
                }}
              >
                {/* Left Specs Column */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Make</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                      {vehicle.make}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Model</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                      {vehicle.model}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Mileage</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                      {vehicle.mileage || '24,500 mi'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>VIN</Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        color: 'text.primary',
                      }}
                    >
                      {vehicle.vin}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Title Status</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                      {vehicle.title_status || 'Clean'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Location</Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'primary.main',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {vehicle.location || 'Mississauga, ON'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Seller</Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                        {vehicle.seller || 'Paul_V'}
                      </Typography>
                      <Box
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: 'rgba(0, 85, 229, 0.08)',
                          color: 'primary.main',
                          px: 0.75,
                          py: 0.2,
                          borderRadius: 1,
                          cursor: 'pointer',
                        }}
                      >
                        Contact
                      </Box>
                    </Stack>
                  </Box>
                </Box>

                {/* Right Specs Column */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>Engine</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', textAlign: 'right' }}>
                      {vehicle.engine || '2.5L Turbo 4-Cylinder'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>Drivetrain</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', textAlign: 'right' }}>
                      {vehicle.drivetrain || 'AWD'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>Transmission</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', textAlign: 'right' }}>
                      {vehicle.transmission || 'Automatic'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>Body Style</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', textAlign: 'right' }}>
                      {vehicle.body_style}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>Exterior Color</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', textAlign: 'right' }}>
                      {vehicle.exterior_color || 'Blue Pearl'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>Interior Color</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', textAlign: 'right' }}>
                      {vehicle.interior_color || 'Black'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>Seller Type</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', textAlign: 'right' }}>
                      {vehicle.seller_type || 'Private Party'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Buy Now Action Area (Highlighted at the bottom of the specifications card) */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {vehicle.buy_now_price ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => setBidSuccessNotice(`Buy Now price of $${vehicle.buy_now_price.toLocaleString()} selected!`)}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 1.35,
                    borderRadius: 1.5,
                    boxShadow: '0 4px 14px rgba(0, 85, 229, 0.25)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      boxShadow: '0 6px 20px rgba(0, 85, 229, 0.35)',
                    },
                  }}
                >
                  Buy Now ${vehicle.buy_now_price.toLocaleString()}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  disabled
                  sx={{
                    py: 1.25,
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    borderColor: 'divider',
                  }}
                >
                  Auction Only (No Buy Now)
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Section: Condition Report & Auction Overview (outside of table for plenty of room) */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 4 },
          mt: 3,
          borderRadius: 2,
          borderColor: 'divider',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              Condition Report & Inspection
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Verified assessment from independent on-site vehicle inspectors.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor:
                vehicle.condition_grade >= 4.0
                  ? 'rgba(22, 163, 74, 0.08)'
                  : vehicle.condition_grade >= 2.5
                  ? 'rgba(217, 119, 6, 0.08)'
                  : 'rgba(220, 38, 38, 0.08)',
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor:
                vehicle.condition_grade >= 4.0
                  ? 'rgba(22, 163, 74, 0.2)'
                  : vehicle.condition_grade >= 2.5
                  ? 'rgba(217, 119, 6, 0.2)'
                  : 'rgba(220, 38, 38, 0.2)',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                Inspection Grade
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  lineHeight: 1.1,
                  color:
                    vehicle.condition_grade >= 4.0
                      ? 'success.main'
                      : vehicle.condition_grade >= 2.5
                      ? 'warning.main'
                      : 'error.main',
                }}
              >
                {vehicle.condition_grade} / 5.0
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ lineHeight: 1.85, color: 'text.primary', fontSize: '0.95rem' }}>
          {vehicle.condition_report}
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        {/* Sub-header Banner: CARFAX report & Auction ending time (Moved to very bottom) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 3,
            pt: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
 

          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500 }}>
            Ending {formatEndDate(vehicle.auction_end)}   anything to display ?
          </Typography>
        </Box>
      </Paper>

      {/* Place Bid Interactive Dialog */}
      <Dialog
        open={bidDialogOpen}
        onClose={() => setBidDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Place Your Bid</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current high bid is <strong>${currentBid.toLocaleString()}</strong>. Your bid must be at least $250 higher.
          </Typography>

          <TextField
            autoFocus
            label="Bid Amount"
            type="number"
            fullWidth
            value={bidInput}
            onChange={(e) => setBidInput(Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setBidInput(currentBid + 250)}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              +$250
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setBidInput(currentBid + 500)}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              +$500
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setBidInput(currentBid + 1000)}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              +$1,000
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBidDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBid}
            disabled={bidInput <= currentBid}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Confirm Bid of ${bidInput.toLocaleString()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bid Placement Success Notice */}
      <Snackbar
        open={Boolean(bidSuccessNotice)}
        autoHideDuration={4000}
        onClose={() => setBidSuccessNotice('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setBidSuccessNotice('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {bidSuccessNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function AppLayout({ base = '' }) {
  const [favorites, setFavorites] = React.useState([]);
  const [compare, setCompare] = React.useState([]);
  const [notice, setNotice] = React.useState('');
  const location = useLocation();
  const homePath = base || '/';

  const toggleFavorite = React.useCallback((vehicleId) => {
    setFavorites((current) =>
      current.includes(vehicleId)
        ? current.filter((id) => id !== vehicleId)
        : [...current, vehicleId],
    );
  }, []);

  const toggleCompare = React.useCallback((vehicleId) => {
    if (compare.includes(vehicleId)) {
      setCompare((current) => current.filter((id) => id !== vehicleId));
      setNotice('');
      return;
    }

    if (compare.length >= MAX_COMPARE) {
      setNotice(`You can compare up to ${MAX_COMPARE} vehicles. Remove one before adding another.`);
      return;
    }

    setCompare((current) => (current.includes(vehicleId) ? current : [...current, vehicleId]));
    setNotice('');
  }, [compare]);

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <Toolbar
          sx={{
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap',
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 56, sm: 60 },
          }}
        >
          <Box
            component={Link}
            to={homePath}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              mr: 'auto',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              The Block
            </Typography>
            <Chip
              label="DEMO"
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 20,
                borderRadius: 1,
                letterSpacing: '0.05em',
              }}
            />
          </Box>

          <Button
            component={Link}
            to={homePath}
            sx={{
              fontWeight: location.pathname === homePath ? 700 : 500,
              color: location.pathname === homePath ? 'primary.main' : 'text.secondary',
              borderBottom: location.pathname === homePath ? '2px solid' : '2px solid transparent',
              borderColor: location.pathname === homePath ? 'primary.main' : 'transparent',
              borderRadius: 0,
              px: 1.5,
              py: 1,
              textTransform: 'none',
              fontSize: '0.925rem',
              '&:hover': {
                bgcolor: 'rgba(0, 85, 229, 0.04)',
                color: 'primary.main',
              },
            }}
          >
            Inventory
          </Button>

          <Button
            component={Link}
            to={`${base}/favorites`}
            startIcon={
              favorites.length > 0 ? (
                <FavoriteIcon sx={{ color: '#e53935', fontSize: '1.25rem' }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
              )
            }
            sx={{
              fontWeight: location.pathname === `${base}/favorites` || favorites.length > 0 ? 700 : 500,
              color:
                favorites.length > 0
                  ? '#d32f2f'
                  : location.pathname === `${base}/favorites`
                  ? 'primary.main'
                  : 'text.secondary',
              borderBottom: location.pathname === `${base}/favorites` ? '2px solid' : '2px solid transparent',
              borderColor:
                location.pathname === `${base}/favorites`
                  ? favorites.length > 0
                    ? '#d32f2f'
                    : 'primary.main'
                  : 'transparent',
              borderRadius: 0,
              px: 1.5,
              py: 1,
              textTransform: 'none',
              fontSize: '0.925rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: favorites.length > 0 ? 'rgba(229, 57, 53, 0.08)' : 'rgba(0, 85, 229, 0.04)',
                color: favorites.length > 0 ? '#d32f2f' : 'primary.main',
              },
            }}
          >
            Favorites ({favorites.length})
          </Button>

          <Button
            component={Link}
            to={`${base}/compare`}
            startIcon={
              <CompareArrowsIcon
                sx={{
                  color: compare.length > 0 ? 'primary.main' : 'text.secondary',
                  fontSize: '1.25rem',
                }}
              />
            }
            sx={{
              fontWeight: location.pathname === `${base}/compare` || compare.length > 0 ? 700 : 500,
              color:
                compare.length > 0
                  ? 'primary.main'
                  : location.pathname === `${base}/compare`
                  ? 'primary.main'
                  : 'text.secondary',
              borderBottom: location.pathname === `${base}/compare` ? '2px solid' : '2px solid transparent',
              borderColor: location.pathname === `${base}/compare` ? 'primary.main' : 'transparent',
              borderRadius: 0,
              px: 1.5,
              py: 1,
              textTransform: 'none',
              fontSize: '0.925rem',
              '&:hover': {
                bgcolor: 'rgba(0, 85, 229, 0.04)',
              },
            }}
          >
            Compare ({compare.length}/{MAX_COMPARE})
          </Button>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              compare={compare}
              toggleCompare={toggleCompare}
              base={base}
            />
          }
        />
        <Route
          path="/favorites"
          element={<FavoritesPage favorites={favorites} toggleFavorite={toggleFavorite} base={base} />}
        />
        <Route
          path="/compare"
          element={<ComparePage compare={compare} toggleCompare={toggleCompare} base={base} />}
        />
        <Route path="/vehicles/:id" element={<DetailsPage favorites={favorites} toggleFavorite={toggleFavorite} base={base} />} />
        <Route
          path="*"
          element={
            <Container sx={{ py: 4 }}>
              <Typography>Page not found.</Typography>
              <Button component={Link} to={homePath}>Go home</Button>
            </Container>
          }
        />
      </Routes>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setNotice('')} severity="warning" variant="filled" sx={{ width: '100%' }}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Router-less version so the demo can be embedded inside the real app's
// <Router> (React Router does not allow nested routers).
export function DataGridDemoApp({ base = '' }) {
  return <AppLayout base={base} />;
}

export default function DataGridDemo() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
