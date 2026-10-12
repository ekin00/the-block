import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FavoritesPage from './FavoritesPage';

const theme = createTheme();

let mockFavoritesState = {
    status: 'ready',
    favoriteIds: [],
    favoriteVehicles: [],
    favoriteCount: 0,
    error: null,
    toggleFavorite: vi.fn(),
    refreshFavorites: vi.fn(),
};

vi.mock('../context/FavoritesContext', () => ({
    useFavorites: () => mockFavoritesState,
}));

vi.mock('../context/UserContext', () => ({
    useUser: () => ({ user: { id: 1, name: 'GUEST1' } }),
}));

vi.mock('../features/vehicles/useAuctionClock', () => ({
    useAuctionClock: () => new Date('2026-10-10T12:00:00Z'),
}));

const mockVehicles = [
    {
        id: 'fav-1',
        year: 2023,
        make: 'Toyota',
        model: 'Tacoma',
        trim: 'TRD Pro',
        odometer_mi: 15000,
        current_bid: 42000,
        starting_bid: 35000,
        auction_end: '2026-10-12T12:00:00Z',
        auctionPhase: 'open',
    },
    {
        id: 'fav-2',
        year: 2021,
        make: 'Ford',
        model: 'Mustang',
        trim: 'GT',
        odometer_mi: 25000,
        current_bid: 31000,
        starting_bid: 28000,
        auction_end: '2026-10-09T12:00:00Z', // closed
        auctionPhase: 'closed',
    },
];

const renderComponent = () =>
    render(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <FavoritesPage />
            </MemoryRouter>
        </ThemeProvider>,
    );

describe('FavoritesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFavoritesState = {
            status: 'ready',
            favoriteIds: [],
            favoriteVehicles: [],
            favoriteCount: 0,
            error: null,
            toggleFavorite: vi.fn().mockResolvedValue({ success: true }),
            refreshFavorites: vi.fn(),
        };
    });

    it('renders empty state when there are no favorites', () => {
        renderComponent();

        expect(screen.getByText('Favorites')).toBeTruthy();
        expect(screen.getByText('No favorites yet')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Browse vehicles' })).toBeTruthy();
    });

    it('renders favorite vehicles including closed ones with showFavorite column', () => {
        mockFavoritesState.favoriteIds = ['fav-1', 'fav-2'];
        mockFavoritesState.favoriteVehicles = mockVehicles;
        mockFavoritesState.favoriteCount = 2;

        renderComponent();

        expect(screen.getByText('2 saved')).toBeTruthy();
        expect(screen.getByText('Toyota')).toBeTruthy();
        expect(screen.getByText('Tacoma')).toBeTruthy();
        expect(screen.getByText('Ford')).toBeTruthy();
        expect(screen.getByText('Mustang')).toBeTruthy();

        // Favorite column header is present
        expect(screen.getByRole('columnheader', { name: 'Favorite' })).toBeTruthy();
    });

    it('calls toggleFavorite when clicking favorite icon button', () => {
        mockFavoritesState.favoriteIds = ['fav-1'];
        mockFavoritesState.favoriteVehicles = [mockVehicles[0]];
        mockFavoritesState.favoriteCount = 1;

        renderComponent();

        const removeBtn = screen.getByRole('button', { name: 'Remove favorite' });
        fireEvent.click(removeBtn);

        expect(mockFavoritesState.toggleFavorite).toHaveBeenCalledWith('fav-1');
    });

    it('renders loading skeleton when loading with 0 favorites', () => {
        mockFavoritesState.status = 'loading';
        mockFavoritesState.favoriteVehicles = [];

        renderComponent();

        expect(screen.getByLabelText('Loading favorites')).toBeTruthy();
    });

    it('renders error alert when error occurs', () => {
        mockFavoritesState.status = 'error';
        mockFavoritesState.error = new Error('Network error');

        renderComponent();

        expect(screen.getByText(/Failed to load favorites/)).toBeTruthy();
        const retryBtn = screen.getByRole('button', { name: 'Retry' });
        fireEvent.click(retryBtn);
        expect(mockFavoritesState.refreshFavorites).toHaveBeenCalled();
    });
});
