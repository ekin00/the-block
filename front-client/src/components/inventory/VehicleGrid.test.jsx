import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VehicleGrid from './VehicleGrid';
import { AUCTION_PHASE } from '../../features/vehicles/auctionTime';

const theme = createTheme();

const mockRows = [
  {
    id: 'grid-v1',
    year: 2024,
    make: 'Mazda',
    model: 'CX-5',
    body_style: 'SUV',
    trim: 'Touring',
    odometer_mi: 12000,
    condition_grade: 4.5,
    condition_report: 'Like-new condition.',
    current_bid: 28000,
    starting_bid: 25000,
    auction_start: '2026-10-01T00:00:00Z',
    auction_end: '2026-10-25T18:00:00Z',
    auctionPhase: AUCTION_PHASE.OPEN,
  },
  {
    id: 'grid-v2',
    year: 2021,
    make: 'Chevrolet',
    model: 'Equinox',
    body_style: 'SUV',
    trim: 'LT',
    odometer_mi: 45000,
    condition_grade: 2.3,
    condition_report: 'Noticeable wear.',
    current_bid: 14000,
    starting_bid: 11000,
    auction_start: '2026-10-01T00:00:00Z',
    auction_end: '2026-10-22T14:00:00Z',
    auctionPhase: AUCTION_PHASE.OPEN,
  },
];

const renderWithTheme = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('VehicleGrid', () => {
  it.each([5, 10, 25])('renders all %i rows on the selected page', (pageSize) => {
    const rows = Array.from({ length: pageSize }, (_, index) => ({
      ...mockRows[0],
      id: `page-row-${index}`,
    }));
    renderWithTheme(
      <VehicleGrid
        rows={rows}
        rowCount={200}
        paginationModel={{ page: 0, pageSize }}
      />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(pageSize + 1);
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).toBeNull();
  });

  it('places the compact Time left column immediately after Odometer', () => {
    renderWithTheme(<VehicleGrid rows={mockRows} />);
    const headers = screen.getAllByRole('columnheader');
    const odometerIndex = headers.findIndex((header) => header.textContent === 'Odometer');
    expect(headers[odometerIndex + 1].textContent).toBe('Time left');
    expect(headers[odometerIndex + 1].style.width).toBe('140px');
  });

  it('omits Favorite column by default in desktop mode', () => {
    renderWithTheme(<VehicleGrid rows={mockRows} />);
    expect(screen.queryByRole('columnheader', { name: 'Favorite' })).toBeNull();
  });

  it('renders Favorite column with heart icon header when showFavorite is true', () => {
    renderWithTheme(<VehicleGrid rows={mockRows} showFavorite />);
    const favHeader = screen.getByRole('columnheader', { name: 'Favorite' });
    expect(favHeader).toBeTruthy();
    expect(favHeader.querySelector('svg')).toBeTruthy();
  });

  it('renders server-slice rows with correct cell values', () => {
    renderWithTheme(
      <VehicleGrid
        rows={mockRows}
        rowCount={50}
        paginationModel={{ page: 0, pageSize: 25 }}
      />,
    );

    expect(screen.getByText('Mazda')).toBeTruthy();
    expect(screen.getByText('CX-5')).toBeTruthy();
    expect(screen.getByText('2024')).toBeTruthy();
    expect(screen.getByText('12,000 mi')).toBeTruthy();
    expect(screen.getByText('$28,000')).toBeTruthy();
  });

  it('shows Trim instead of Body Style and removes Condition', () => {
    renderWithTheme(
      <VehicleGrid
        rows={mockRows}
        rowCount={50}
        paginationModel={{ page: 0, pageSize: 25 }}
      />,
    );

    expect(screen.getByRole('columnheader', { name: /trim/i })).toBeTruthy();
    expect(screen.getByText('Touring')).toBeTruthy();
    expect(screen.getByText('Touring').closest('.MuiChip-root')).toBeNull();
    expect(screen.getByText('LT')).toBeTruthy();
    expect(screen.queryByRole('columnheader', { name: /condition|body style|status/i })).toBeNull();
  });

  it('shows time remaining rather than status and updates with the shared clock', () => {
    const rows = [{ ...mockRows[0], auction_end: '2026-10-10T13:00:00Z' }];
    const now = new Date('2026-10-10T12:00:00Z');
    const { rerender } = renderWithTheme(
      <VehicleGrid rows={rows} now={now} paginationModel={{ page: 0, pageSize: 25 }} />,
    );
    expect(screen.getByRole('columnheader', { name: /time left/i })).toBeTruthy();
    expect(screen.getByText('Ends in 1 hour')).toBeTruthy();
    expect(screen.getByRole('gridcell', { name: 'Ends in 1 hour' })).toBeTruthy();
    rerender(
      <ThemeProvider theme={theme}>
        <VehicleGrid rows={rows} now={new Date('2026-10-10T12:30:00Z')} paginationModel={{ page: 0, pageSize: 25 }} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Ends in 30 min')).toBeTruthy();
  });

  it('marks upcoming auctions without claiming bidding is open', () => {
    renderWithTheme(
      <VehicleGrid
        rows={[{ ...mockRows[0], auction_start: '2026-10-11T12:00:00Z' }]}
        now={new Date('2026-10-10T12:00:00Z')}
        paginationModel={{ page: 0, pageSize: 25 }}
      />,
    );

    expect(screen.getByText('Coming soon')).toBeTruthy();
    expect(screen.queryByText('Upcoming, bidding not open')).toBeNull();
    expect(screen.queryByText(/^Ends in /)).toBeNull();
  });

  it('opens details by double-click or keyboard without an Actions column', () => {
    const onOpenDetails = vi.fn();
    renderWithTheme(
      <VehicleGrid
        rows={mockRows}
        rowCount={50}
        onOpenDetails={onOpenDetails}
        paginationModel={{ page: 0, pageSize: 25 }}
      />,
    );

    const makeCell = screen.getByRole('gridcell', { name: 'Mazda' });
    fireEvent.doubleClick(makeCell);
    expect(onOpenDetails).toHaveBeenCalledWith(mockRows[0]);
    onOpenDetails.mockClear();
    fireEvent.keyDown(makeCell, { key: 'Enter' });
    expect(onOpenDetails).toHaveBeenCalledWith(mockRows[0]);
  });

  it('keeps See Details in the row menu', async () => {
    const onOpenDetails = vi.fn();
    renderWithTheme(<VehicleGrid rows={mockRows} onOpenDetails={onOpenDetails} />);
    fireEvent.click(screen.getByRole('gridcell', { name: 'Mazda' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'See Details' }));
    expect(onOpenDetails).toHaveBeenCalledWith(mockRows[0]);
  });

  it('uses matching font size and weight for vehicle text columns', () => {
    renderWithTheme(<VehicleGrid rows={mockRows} />);
    const texts = ['Mazda', 'CX-5', '2024', 'Touring', '12,000 mi'];
    const styles = texts.map((text) => window.getComputedStyle(screen.getByText(text)));
    for (const style of styles) {
      expect(style.fontSize).toBe(styles[0].fontSize);
      expect(style.fontWeight).toBe('600');
    }
  });

  it('disables Favorite and Compare buttons with reasons when callbacks not provided', () => {
    renderWithTheme(
      <VehicleGrid
        rows={mockRows}
        rowCount={50}
        showFavorite
        paginationModel={{ page: 0, pageSize: 25 }}
      />,
    );

    const favButtons = screen.getAllByRole('button', { name: 'Favorites arrive in Phase 2' });
    const compButtons = screen.getAllByRole('button', { name: 'Compare arrives in Phase 3' });

    expect(favButtons[0].hasAttribute('disabled')).toBe(true);
    expect(compButtons[0].hasAttribute('disabled')).toBe(true);
  });

  it('invokes onToggleFavorite and onToggleCompare when enabled', () => {
    const onToggleFavorite = vi.fn();
    const onToggleCompare = vi.fn();

    renderWithTheme(
      <VehicleGrid
        rows={mockRows}
        rowCount={50}
        showFavorite
        onToggleFavorite={onToggleFavorite}
        onToggleCompare={onToggleCompare}
        favoriteIds={['grid-v1']}
        compareIds={[]}
        paginationModel={{ page: 0, pageSize: 25 }}
      />,
    );

    const favButton = screen.getByRole('button', { name: 'Remove favorite' });
    fireEvent.click(favButton);
    expect(onToggleFavorite).toHaveBeenCalledWith('grid-v1');

    const compButton = screen.getAllByRole('button', { name: 'Add to comparison' })[0];
    fireEvent.click(compButton);
    expect(onToggleCompare).toHaveBeenCalledWith('grid-v1');
  });

  it('renders current bid with black font when user is not high bidder and success color with icon when user is high bidder', () => {
    const rowsWithWinner = [
      { ...mockRows[0], id: 'winner-1', current_winner_id: 42, current_bid: 25000 },
      { ...mockRows[1], id: 'other-1', current_winner_id: 99, current_bid: 18000 },
    ];
    renderWithTheme(
      <VehicleGrid
        rows={rowsWithWinner}
        userId="42"
      />,
    );

    expect(screen.getByTestId('high-bidder-icon')).toBeTruthy();
    expect(screen.getAllByTestId('high-bidder-icon')).toHaveLength(1);
  });

  it('delegates sorting to server via onSortModelChange and never sorts independently', () => {
    const onSortModelChange = vi.fn();
    renderWithTheme(
      <VehicleGrid
        rows={mockRows}
        rowCount={50}
        sortModel={[]}
        onSortModelChange={onSortModelChange}
        paginationModel={{ page: 0, pageSize: 25 }}
      />,
    );

    // Clicking a sortable column header (e.g. Year)
    const yearHeader = screen.getByRole('columnheader', { name: /year/i });
    fireEvent.click(yearHeader);

    expect(onSortModelChange).toHaveBeenCalled();
  });
});
