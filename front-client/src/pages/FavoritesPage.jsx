import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuctionClock } from '../features/vehicles/useAuctionClock';
import VehicleGrid from '../components/inventory/VehicleGrid';
import VehicleCardList from '../components/inventory/VehicleCardList';
import { compareByAuctionEnd } from '../features/vehicles/auctionTime';


const DEFAULT_PAGE_SIZE = 25;
const MOBILE_PAGE_SIZE = 10;

/**
 * Production Favorites Page. Reuses VehicleGrid with showFavorite={true} on desktop
 * and VehicleCardList on mobile. Saved closed vehicles remain visible with their
 * closed status and disabled bidding.
 */
const FavoritesPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
    const now = useAuctionClock();

    const {
        status,
        favoriteIds,
        favoriteVehicles,
        toggleFavorite,
        refreshFavorites,
        error,
    } = useFavorites();

    const [notice, setNotice] = useState(null);
    const [sortModel, setSortModel] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: isMobile ? MOBILE_PAGE_SIZE : DEFAULT_PAGE_SIZE,
    });

    const handleToggleFavorite = async (vehicleId) => {
        const isFav = favoriteIds.includes(vehicleId);
        const result = await toggleFavorite(vehicleId);
        if (!result.success) {
            setNotice({
                severity: 'error',
                message: result.error?.message || 'Could not update favorites. Please try again.',
            });
        } else {
            setNotice({
                severity: 'success',
                message: isFav ? 'Removed from favorites' : 'Added to favorites',
            });
        }
    };

    // Sort favorite vehicles: use user sort model if active, else preserve add-date or auction end
    const sortedVehicles = useMemo(() => {
        const list = [...favoriteVehicles];
        if (sortModel.length > 0) {
            const { field, sort } = sortModel[0];
            const direction = sort === 'desc' ? -1 : 1;
            return list.sort((a, b) => {
                if (field === 'auction_end') {
                    return compareByAuctionEnd(a, b, now) * direction;
                }
                const valA = a[field];
                const valB = b[field];
                if (valA == null && valB == null) return 0;
                if (valA == null) return 1;
                if (valB == null) return -1;
                if (typeof valA === 'string') {
                    return valA.localeCompare(valB) * direction;
                }
                return (valA - valB) * direction;
            });
        }
        return list;
    }, [favoriteVehicles, sortModel, now]);

    // Page slice
    const { page, pageSize } = paginationModel;
    const pageRows = useMemo(() => {
        const start = page * pageSize;
        return sortedVehicles.slice(start, start + pageSize);
    }, [sortedVehicles, page, pageSize]);

    const rendererProps = {
        rows: pageRows,
        rowCount: sortedVehicles.length,
        now,
        userId: user?.id,
        favoriteIds,
        onToggleFavorite: handleToggleFavorite,
        paginationModel,
        onPaginationModelChange: setPaginationModel,
        onOpenDetails: (vehicle) => navigate(`/vehicles/${encodeURIComponent(vehicle.id)}`),
    };

    return (
        <Box sx={{ width: '90%', py: { xs: 2, sm: 3 } }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}
                    >
                        Favorites
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        Your saved vehicles. The count in the navigation updates immediately.
                    </Typography>
                </Box>
                {sortedVehicles.length > 0 && (
                    <Chip
                        icon={<FavoriteIcon sx={{ color: '#e53935 !important', fontSize: '1rem' }} />}
                        label={`${sortedVehicles.length} saved`}
                        variant="outlined"
                        sx={{ fontWeight: 600, borderColor: 'divider' }}
                    />
                )}
            </Stack>

            {status === 'loading' && favoriteVehicles.length === 0 ? (
                <Stack spacing={1} aria-label="Loading favorites">
                    <Skeleton variant="rounded" height={48} />
                    <Skeleton variant="rounded" height={320} />
                </Stack>
            ) : null}

            {status === 'error' && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={refreshFavorites}>
                            Retry
                        </Button>
                    }
                >
                    {error?.message ? `Failed to load favorites: ${error.message}` : 'Failed to load favorites.'}
                </Alert>
            )}

            {status !== 'loading' && sortedVehicles.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 2,
                        borderColor: 'divider',
                    }}
                >
                    <FavoriteBorderIcon sx={{ fontSize: 48, mb: 1.5, color: 'text.disabled' }} />
                    <Typography variant="h6" fontWeight={600}>
                        No favorites yet
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                        Return to the inventory and click a heart or select Save Favorite in the row menu.
                    </Typography>
                    <Button
                        component={Link}
                        to="/inventory"
                        variant="contained"
                        sx={{ borderRadius: 1.5, textTransform: 'none', minHeight: 44 }}
                    >
                        Browse vehicles
                    </Button>
                </Paper>
            ) : null}

            {sortedVehicles.length > 0 ? (
                isMobile ? (
                    <VehicleCardList {...rendererProps} />
                ) : (
                    <VehicleGrid
                        {...rendererProps}
                        showFavorite={true}
                        sortModel={sortModel}
                        onSortModelChange={setSortModel}
                    />
                )
            ) : null}

            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={3000}
                onClose={() => setNotice(null)}
                message={notice?.message}
            />
        </Box>
    );
};

export default FavoritesPage;
