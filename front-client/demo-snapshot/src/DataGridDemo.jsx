/* eslint-disable react/prop-types */
import * as React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  Alert,
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
import { useDemo, DemoProvider } from './context/DemoContext';
import InventorySearchBar from './components/inventory/InventorySearchBar';
import InventorySidebarFilter from './components/inventory/InventorySidebarFilter';

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
    odometer: 14200,
    fuel_type: 'Gasoline',
    exterior_color: 'Dark Moss',
    interior_color: 'Black Leather',
    title_status: 'Clean (ON)',
    title_type: 'Clean Title',
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
    odometer: 58300,
    fuel_type: 'Gasoline',
    exterior_color: 'Tornado Red',
    interior_color: 'Titan Black Tartan',
    title_status: 'Clean (NY)',
    title_type: 'Clean Title',
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
    odometer: 18900,
    fuel_type: 'Gasoline',
    exterior_color: 'Ebony Twilight Metallic',
    interior_color: 'Jet Black',
    title_status: 'Clean (ON)',
    title_type: 'Clean Title',
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
    odometer: 8400,
    fuel_type: 'Gasoline',
    exterior_color: 'Gravity Grey',
    interior_color: 'Black Cloth',
    title_status: 'Clean (QC)',
    title_type: 'Clean Title',
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
  },
  {
    id: 'toyota-camry-2023-01',
    vin: '4T1B11HK5PU789214',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    body_style: 'Sedan',
    engine: '2.5L 4-Cylinder DOHC',
    drivetrain: 'FWD',
    transmission: '8-Speed Automatic',
    mileage: '32,100 mi',
    odometer: 32100,
    fuel_type: 'Gasoline',
    exterior_color: 'Celestial Silver Metallic',
    interior_color: 'Ash Fabric',
    title_status: 'Clean Title (ON)',
    title_type: 'Clean Title',
    location: 'London, ON',
    seller: 'Toyota Certified Pre-Owned',
    seller_type: 'Dealer',
    comments_count: 24,
    condition_grade: 4.5,
    condition_report:
      'One owner vehicle. Regularly serviced at authorized dealer. Excellent mechanical condition and spotless interior.',
    auction_start: '2026-10-06T11:00:00',
    auction_end: '2026-10-13T16:00:00',
    starting_bid: 16000,
    reserve_price: 22000,
    buy_now_price: 25500,
    current_bid: 21500,
    bid_count: 14,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2023+Toyota+Camry+Front',
      'https://placehold.co/800x600/1e293b/eaeaea?text=2023+Toyota+Camry+Side',
      'https://placehold.co/800x600/0f172a/eaeaea?text=2023+Toyota+Camry+Interior'
    ],
  },
  {
    id: 'toyota-corolla-2022-02',
    vin: 'JTDE4MBE8NJ091244',
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    body_style: 'Sedan',
    engine: '1.8L 4-Cylinder DOHC',
    drivetrain: 'FWD',
    transmission: 'Automatic',
    mileage: '41,500 mi',
    odometer: 41500,
    fuel_type: 'Gasoline',
    exterior_color: 'Blueprint',
    interior_color: 'Black Cloth',
    title_status: 'Clean Title (ON)',
    title_type: 'Clean Title',
    location: 'Oakville, ON',
    seller: 'Lakeside Auto',
    seller_type: 'Dealer',
    comments_count: 12,
    condition_grade: 4.1,
    condition_report:
      'Clean title, no accidents reported. Fresh oil change and brake pads inspected.',
    auction_start: '2026-10-07T10:00:00',
    auction_end: '2026-10-14T14:00:00',
    starting_bid: 13000,
    reserve_price: 18000,
    buy_now_price: 21000,
    current_bid: 17500,
    bid_count: 9,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2022+Toyota+Corolla+Front',
      'https://placehold.co/800x600/1e293b/eaeaea?text=2022+Toyota+Corolla+Interior'
    ],
  },
  {
    id: 'toyota-rav4-2024-03',
    vin: '2T3P1RFV5RW198302',
    make: 'Toyota',
    model: 'RAV4',
    year: 2024,
    body_style: 'SUV',
    engine: '2.5L 4-Cylinder',
    drivetrain: 'AWD',
    transmission: '8-Speed Automatic',
    mileage: '12,800 mi',
    odometer: 12800,
    fuel_type: 'Gasoline',
    exterior_color: 'Magnetic Gray Metallic',
    interior_color: 'Black SofTex',
    title_status: 'Clean Title (BC)',
    title_type: 'Clean Title',
    location: 'Vancouver, BC',
    seller: 'Pacific Motors',
    seller_type: 'Dealer',
    comments_count: 31,
    condition_grade: 4.7,
    condition_report:
      'Like-new condition. All-wheel drive, technology package included. Full factory warranty remaining.',
    auction_start: '2026-10-05T12:00:00',
    auction_end: '2026-10-12T18:00:00',
    starting_bid: 22000,
    reserve_price: 31000,
    buy_now_price: 34500,
    current_bid: 29800,
    bid_count: 18,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2024+Toyota+RAV4+Front',
      'https://placehold.co/800x600/1e293b/eaeaea?text=2024+Toyota+RAV4+Rear'
    ],
  },
  {
    id: 'mazda-cx5-2025-04',
    vin: 'JM3KFBCM9R0123982',
    make: 'Mazda',
    model: 'CX-5',
    year: 2025,
    body_style: 'SUV',
    engine: '2.5L Turbo I4',
    drivetrain: 'AWD',
    transmission: 'Automatic',
    mileage: '15,200 mi',
    odometer: 15200,
    fuel_type: 'Gasoline',
    exterior_color: 'Soul Red Crystal',
    interior_color: 'Parchment Leather',
    title_status: 'Clean Title (ON)',
    title_type: 'Clean Title',
    location: 'Mississauga, ON',
    seller: 'Metro Fleet',
    seller_type: 'Dealer',
    comments_count: 19,
    condition_grade: 4.4,
    condition_report:
      'Very well maintained, garage kept, full service history.',
    auction_start: '2026-10-06T10:00:00',
    auction_end: '2026-10-13T15:30:00',
    starting_bid: 19500,
    reserve_price: 27000,
    buy_now_price: 30000,
    current_bid: 26000,
    bid_count: 11,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2025+Mazda+CX-5+Front'
    ],
  },
  {
    id: 'ford-f150-2022-05',
    vin: '1FTFW1ED4NFC92011',
    make: 'Ford',
    model: 'F-150',
    year: 2022,
    body_style: 'Truck',
    engine: '3.5L EcoBoost V6',
    drivetrain: '4WD',
    transmission: 'Automatic',
    mileage: '48,000 mi',
    odometer: 48000,
    fuel_type: 'Gasoline',
    exterior_color: 'Oxford White',
    interior_color: 'Medium Dark Slate',
    title_status: 'Non Repairable',
    title_type: 'Non Repairable',
    location: 'Calgary, AB',
    seller: 'Western Recovery',
    seller_type: 'Fleet',
    comments_count: 15,
    condition_grade: 1.8,
    condition_report:
      'Severe front impact damage. Sold for parts or scrap dismantling only.',
    auction_start: '2026-10-04T09:00:00',
    auction_end: '2026-10-11T14:00:00',
    starting_bid: 5000,
    reserve_price: 9000,
    buy_now_price: 12000,
    current_bid: 8200,
    bid_count: 12,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2022+Ford+F-150+Front'
    ],
  },
  {
    id: 'chevrolet-equinox-2021-06',
    vin: '3GNAXKEV8MS194830',
    make: 'Chevrolet',
    model: 'Equinox',
    year: 2021,
    body_style: 'SUV',
    engine: '1.5L Turbo 4-Cylinder',
    drivetrain: 'AWD',
    transmission: 'Automatic',
    mileage: '62,000 mi',
    odometer: 62000,
    fuel_type: 'Gasoline',
    exterior_color: 'Mosaic Black',
    interior_color: 'Jet Black',
    title_status: 'Salvage Title (QC)',
    title_type: 'Salvage Title',
    location: 'Laval, QC',
    seller: 'Direct Auction Rebuilders',
    seller_type: 'Dealer',
    comments_count: 22,
    condition_grade: 2.2,
    condition_report:
      'Rear quarter panel damage repaired. Frame measured straight, needs final inspection.',
    auction_start: '2026-10-05T13:00:00',
    auction_end: '2026-10-12T17:00:00',
    starting_bid: 7000,
    reserve_price: 11000,
    buy_now_price: 14000,
    current_bid: 9500,
    bid_count: 7,
    images: [
      'https://placehold.co/800x600/1a1a2e/eaeaea?text=2021+Chevy+Equinox+Front'
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

function VehicleGrid({
  dataRows = rows,
  favorites,
  toggleFavorite,
  compare,
  toggleCompare,
  base,
  showActions = true,
}) {
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

  const selectedVehicle = menu ? dataRows.find((row) => row.id === menu.vehicleId) : null;

  const columns = React.useMemo(
    () => [
      {
        field: 'compareAction',
        headerName: 'Compare',
        width: 95,
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
      {
        field: 'make',
        headerName: 'Make',
        width: 130,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'model',
        headerName: 'Model',
        minWidth: 150,
        flex: 1,
        renderCell: (params) => (
          <Tooltip title={params.row.condition_report || 'No report available'} arrow>
            <span style={{ cursor: 'pointer', fontWeight: 500 }}>{params.value}</span>
          </Tooltip>
        ),
      },
      {
        field: 'year',
        headerName: 'Year',
        type: 'number',
        width: 90,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'body_style',
        headerName: 'body_style',
        width: 125,
        renderCell: (params) => (
          <Chip
            label={params.value || 'N/A'}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.75rem',
              height: 24,
              borderColor: 'divider',
              textTransform: 'capitalize',
            }}
          />
        ),
      },
      {
        field: 'odometer',
        headerName: 'Odometer',
        width: 125,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const miles =
            params.row.odometer ??
            (params.row.mileage
              ? parseInt(String(params.row.mileage).replace(/[^0-9]/g, ''), 10)
              : null);
          return (
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {miles != null && !isNaN(miles) ? `${miles.toLocaleString()} mi` : '—'}
            </Typography>
          );
        },
      },
      {
        field: 'current_bid',
        headerName: 'current_id',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const bid = params.row.current_bid ?? params.row.starting_bid;
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: 'success.main',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {bid != null ? `$${bid.toLocaleString()}` : '—'}
            </Typography>
          );
        },
      },
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
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        ),
      },
      ...(showActions
        ? [
            {
              field: 'actions',
              headerName: 'Actions',
              width: 110,
              sortable: false,
              filterable: false,
              align: 'center',
              headerAlign: 'center',
              renderCell: (params) => (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`${base}/vehicles/${params.row.id}`);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.25,
                    px: 1,
                  }}
                >
                  Details
                </Button>
              ),
            },
          ]
        : []),
    ],
    [base, compare, favorites, navigate, showActions, toggleCompare, toggleFavorite],
  );

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          height: 480,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          borderColor: 'divider',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <DataGrid
          rows={dataRows}
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    excludePurpleWave: false,
    titleType: [],
    odometer: [0, 250000],
    year: [],
    condition: [],
    vehicleType: [],
    make: [],
    model: [],
    engine: [],
    transmission: [],
    fuelType: [],
    drivetrain: [],
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetSection = (sectionKey) => {
    if (sectionKey === 'odometer') {
      setFilters((prev) => ({ ...prev, odometer: [0, 250000] }));
    } else {
      setFilters((prev) => ({ ...prev, [sectionKey]: [] }));
    }
  };

  const handleResetAll = () => {
    setSearchQuery('');
    setFilters({
      excludePurpleWave: false,
      titleType: [],
      odometer: [0, 250000],
      year: [],
      condition: [],
      vehicleType: [],
      make: [],
      model: [],
      engine: [],
      transmission: [],
      fuelType: [],
      drivetrain: [],
    });
  };

  // Autocomplete search suggestions matching screenshot ("toyota camry", "toyota corolla", etc.)
  const searchSuggestions = React.useMemo(() => {
    const list = [
      'toyota camry',
      'toyota corolla',
      'toyota rav4',
      'kia telluride',
      'volkswagen golf gti',
      'gmc terrain',
      'kia forte',
      'mazda cx-5',
      'chevrolet equinox',
      'ford f-150',
    ];
    rows.forEach((r) => {
      list.push(`${r.make} ${r.model}`.toLowerCase());
      list.push(r.make.toLowerCase());
      list.push(r.model.toLowerCase());
    });
    return Array.from(new Set(list));
  }, []);

  // Filter rows dynamically based on search & sidebar filters
  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const searchable = `${row.year} ${row.make} ${row.model} ${row.vin} ${row.body_style}`.toLowerCase();
        const words = q.split(/\s+/);
        const matchesAll = words.every((word) => searchable.includes(word));
        if (!matchesAll) return false;
      }

      // 2. Exclude Purple Wave
      if (filters.excludePurpleWave) {
        if ((row.seller || '').toLowerCase().includes('purple wave')) return false;
      }

      // 3. Title type
      if (filters.titleType && filters.titleType.length > 0) {
        const hasMatch = filters.titleType.some((t) => {
          const title = (row.title_type || row.title_status || '').toLowerCase();
          const cleanT = t.toLowerCase().replace(' title', '').trim();
          return title.includes(cleanT);
        });
        if (!hasMatch) return false;
      }

      // 4. Odometer
      if (filters.odometer) {
        const [minOdo, maxOdo] = filters.odometer;
        const odo = row.odometer ?? parseInt(String(row.mileage || '0').replace(/[^0-9]/g, ''), 10);
        if (odo < minOdo || (maxOdo < 250000 && odo > maxOdo)) return false;
      }

      // 5. Year
      if (filters.year && filters.year.length > 0) {
        if (!filters.year.includes(row.year)) return false;
      }

      // 6. Condition
      if (filters.condition && filters.condition.length > 0) {
        const grade = row.condition_grade || 0;
        const matches = filters.condition.some((c) => {
          if (c === '4') return grade >= 4.0;
          if (c === '3') return grade >= 3.0 && grade < 4.0;
          if (c === '2') return grade >= 2.0 && grade < 3.0;
          if (c === '1') return grade < 2.0;
          return false;
        });
        if (!matches) return false;
      }

      // 7. Vehicle type
      if (filters.vehicleType && filters.vehicleType.length > 0) {
        if (!filters.vehicleType.map((v) => v.toLowerCase()).includes((row.body_style || '').toLowerCase())) {
          return false;
        }
      }

      // 8. Make
      if (filters.make && filters.make.length > 0) {
        if (!filters.make.map((m) => m.toLowerCase()).includes((row.make || '').toLowerCase())) {
          return false;
        }
      }

      // 9. Model
      if (filters.model && filters.model.length > 0) {
        if (!filters.model.map((m) => m.toLowerCase()).includes((row.model || '').toLowerCase())) {
          return false;
        }
      }

      // 10. Engine
      if (filters.engine && filters.engine.length > 0) {
        const eng = (row.engine || '').toLowerCase();
        if (!filters.engine.some((e) => eng.includes(e.toLowerCase()))) return false;
      }

      // 11. Transmission
      if (filters.transmission && filters.transmission.length > 0) {
        const trans = (row.transmission || '').toLowerCase();
        if (!filters.transmission.some((t) => trans.includes(t.toLowerCase()))) return false;
      }

      // 12. Fuel type
      if (filters.fuelType && filters.fuelType.length > 0) {
        const fuel = (row.fuel_type || 'Gasoline').toLowerCase();
        if (!filters.fuelType.some((f) => fuel.includes(f.toLowerCase()))) return false;
      }

      // 13. Drivetrain
      if (filters.drivetrain && filters.drivetrain.length > 0) {
        if (!filters.drivetrain.includes(row.drivetrain)) return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    filters.excludePurpleWave ||
    (filters.titleType && filters.titleType.length > 0) ||
    (filters.odometer && (filters.odometer[0] > 0 || filters.odometer[1] < 250000)) ||
    (filters.year && filters.year.length > 0) ||
    (filters.condition && filters.condition.length > 0) ||
    (filters.vehicleType && filters.vehicleType.length > 0) ||
    (filters.make && filters.make.length > 0) ||
    (filters.model && filters.model.length > 0) ||
    (filters.engine && filters.engine.length > 0) ||
    (filters.transmission && filters.transmission.length > 0) ||
    (filters.fuelType && filters.fuelType.length > 0) ||
    (filters.drivetrain && filters.drivetrain.length > 0)
  );

  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* Left Column: Sidebar Filters */}
        <Grid size={{ xs: 12, md: 4, lg: 3.2 }}>
          <InventorySidebarFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetSection={handleResetSection}
            onResetAll={handleResetAll}
          />
        </Grid>

        {/* Right Column: Search Bar & Inventory Table */}
        <Grid size={{ xs: 12, md: 8, lg: 8.8 }}>
          {/* Top Search Bar */}
          <InventorySearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(query) => setSearchQuery(query)}
            suggestions={searchSuggestions}
            placeholder="Search by make, model, year, VIN..."
          />

          {/* Heading and listing stats */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
                Vehicle inventory
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Browse mock listings. Favorite and Compare can both be toggled directly in their columns.
              </Typography>
            </Box>

            {hasActiveFilters && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${filteredRows.length} of ${rows.length} shown`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Button
                  size="small"
                  onClick={handleResetAll}
                  sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#0055E5' }}
                >
                  Clear all
                </Button>
              </Stack>
            )}
          </Stack>

          {/* Table */}
          <VehicleGrid
            dataRows={filteredRows}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            compare={compare}
            toggleCompare={toggleCompare}
            base={base}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function FavoritesPage({ favorites, toggleFavorite, compare, toggleCompare, base }) {
  const favoriteRows = rows.filter((row) => favorites.includes(row.id));

  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
            Favorites
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Your saved vehicles. The count in the navigation updates immediately.
          </Typography>
        </Box>
        {favoriteRows.length > 0 && (
          <Chip
            icon={<FavoriteIcon sx={{ color: '#e53935 !important', fontSize: '1rem' }} />}
            label={`${favoriteRows.length} saved`}
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: 'divider' }}
          />
        )}
      </Stack>

      {favoriteRows.length ? (
        <VehicleGrid
          dataRows={favoriteRows}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          compare={compare}
          toggleCompare={toggleCompare}
          base={base}
          showActions={true}
        />
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

function ComparePage({ favorites, toggleFavorite, compare, toggleCompare, base }) {
  const comparedRows = rows.filter((row) => compare.includes(row.id));

  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
            Compare vehicles
          </Typography>
          <Typography color="text.secondary" variant="body2">
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
        <VehicleGrid
          dataRows={comparedRows}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          compare={compare}
          toggleCompare={toggleCompare}
          base={base}
          showActions={true}
        />
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
  const {
    favorites,
    compare,
    notice,
    toggleFavorite,
    toggleCompare,
    clearNotice
  } = useDemo();
  const homePath = base || '/';

  return (
    <Box sx={{ width: '100%' }}>
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
          element={
            <FavoritesPage
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              compare={compare}
              toggleCompare={toggleCompare}
              base={base}
            />
          }
        />
        <Route
          path="/compare"
          element={
            <ComparePage
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              compare={compare}
              toggleCompare={toggleCompare}
              base={base}
            />
          }
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
        onClose={clearNotice}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={clearNotice} severity="warning" variant="filled" sx={{ width: '100%' }}>
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
    <DemoProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </DemoProvider>
  );
}
