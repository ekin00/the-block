import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VehicleCard from './VehicleCard';
import { AUCTION_PHASE } from '../../features/vehicles/auctionTime';

const theme = createTheme();

const mockVehicle = {
  id: 'test-v1',
  year: 2023,
  make: 'Honda',
  model: 'Civic',
  trim: 'Sport',
  odometer_mi: 15400,
  current_bid: 18500,
  starting_bid: 15000,
  condition_grade: 4.2,
  condition_report: 'Excellent condition, one owner.',
  auction_start: '2026-10-01T00:00:00Z',
  auction_end: '2026-10-20T00:00:00Z',
  auctionPhase: AUCTION_PHASE.OPEN,
};

const renderWithTheme = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('VehicleCard', () => {
  it('renders vehicle year, make, model, current bid, and odometer_mi', () => {
    renderWithTheme(<VehicleCard vehicle={mockVehicle} now={new Date('2026-10-10T12:00:00Z')} />);

    expect(screen.getByText('2023 Honda Civic')).toBeTruthy();
    expect(screen.getByText('15,400 mi')).toBeTruthy();
    expect(screen.getByText('$18,500')).toBeTruthy();
    expect(screen.getByText('Ends in 10 days')).toBeTruthy();
  });

  it('renders fallback when odometer_mi is not finite', () => {
    const noMilesVehicle = { ...mockVehicle, odometer_mi: null };
    renderWithTheme(<VehicleCard vehicle={noMilesVehicle} />);

    expect(screen.getByText('Mileage unavailable')).toBeTruthy();
  });

  it('renders starting_bid if current_bid is missing', () => {
    const noCurrentBid = { ...mockVehicle, current_bid: null, starting_bid: 12000 };
    renderWithTheme(<VehicleCard vehicle={noCurrentBid} />);

    expect(screen.getByText('$12,000')).toBeTruthy();
  });

  it('shows trim without a condition grade chip', () => {
    renderWithTheme(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.getByText('Trim: Sport')).toBeTruthy();
    expect(screen.queryByText('Grade 4.2')).toBeNull();
  });

  it('has accessible Details button with >= 44px touch target and calls onOpenDetails', () => {
    const onOpenDetails = vi.fn();
    renderWithTheme(<VehicleCard vehicle={mockVehicle} onOpenDetails={onOpenDetails} />);

    const detailsButton = screen.getByRole('button', { name: /view details for 2023 honda civic/i });
    expect(detailsButton).toBeTruthy();

    fireEvent.click(detailsButton);
    expect(onOpenDetails).toHaveBeenCalledWith(mockVehicle);
  });

  it('disables Favorite and Compare buttons with reasons when callbacks are not provided', () => {
    renderWithTheme(<VehicleCard vehicle={mockVehicle} />);

    const favButton = screen.getByRole('button', { name: 'Add to favorites' });
    const compButton = screen.getByRole('button', { name: 'Add to comparison' });

    expect(favButton.hasAttribute('disabled')).toBe(true);
    expect(compButton.hasAttribute('disabled')).toBe(true);
  });

  it('enables Favorite and Compare buttons when callbacks are provided', () => {
    const onToggleFavorite = vi.fn();
    const onToggleCompare = vi.fn();

    renderWithTheme(
      <VehicleCard
        vehicle={mockVehicle}
        onToggleFavorite={onToggleFavorite}
        onToggleCompare={onToggleCompare}
        isFavorite={false}
        isCompared={true}
      />,
    );

    const favButton = screen.getByRole('button', { name: 'Add to favorites' });
    expect(favButton.hasAttribute('disabled')).toBe(false);
    fireEvent.click(favButton);
    expect(onToggleFavorite).toHaveBeenCalledWith('test-v1');

    const compButton = screen.getByRole('button', { name: 'Remove from comparison' });
    expect(compButton.hasAttribute('disabled')).toBe(false);
    fireEvent.click(compButton);
    expect(onToggleCompare).toHaveBeenCalledWith('test-v1');
  });

  it('computes auctionPhase from now prop if row is not pre-annotated', () => {
    const unannotated = {
      ...mockVehicle,
      auctionPhase: undefined,
      auction_start: '2026-10-01T00:00:00Z',
      auction_end: '2026-10-15T00:00:00Z',
    };
    const pastNow = new Date('2026-10-16T00:00:00Z');
    renderWithTheme(<VehicleCard vehicle={unannotated} now={pastNow} />);

    expect(screen.getByText('Ended')).toBeTruthy();
  });
});
