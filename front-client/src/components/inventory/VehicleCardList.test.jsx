import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VehicleCardList from './VehicleCardList';
import { AUCTION_PHASE } from '../../features/vehicles/auctionTime';

const theme = createTheme();

const mockRows = [
  {
    id: 'v-1',
    year: 2021,
    make: 'Toyota',
    model: 'RAV4',
    odometer_mi: 22000,
    current_bid: 24000,
    auctionPhase: AUCTION_PHASE.OPEN,
  },
  {
    id: 'v-2',
    year: 2022,
    make: 'Ford',
    model: 'F-150',
    odometer_mi: 18000,
    current_bid: 35000,
    auctionPhase: AUCTION_PHASE.UPCOMING,
  },
];

const renderWithTheme = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('VehicleCardList', () => {
  it('renders all vehicle cards in rows slice', () => {
    renderWithTheme(<VehicleCardList rows={mockRows} rowCount={25} />);

    expect(screen.getByText('2021 Toyota RAV4')).toBeTruthy();
    expect(screen.getByText('2022 Ford F-150')).toBeTruthy();
  });

  it('renders controlled TablePagination with options [5, 10, 25]', () => {
    renderWithTheme(
      <VehicleCardList
        rows={mockRows}
        rowCount={25}
        paginationModel={{ page: 0, pageSize: 10 }}
      />,
    );

    expect(screen.getByText('1–10 of 25')).toBeTruthy();
  });

  it('invokes onPaginationModelChange on page navigation', () => {
    const onPaginationModelChange = vi.fn();
    renderWithTheme(
      <VehicleCardList
        rows={mockRows}
        rowCount={25}
        paginationModel={{ page: 0, pageSize: 10 }}
        onPaginationModelChange={onPaginationModelChange}
      />,
    );

    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);

    expect(onPaginationModelChange).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
  });

  it('invokes onPaginationModelChange on rows per page change', () => {
    const onPaginationModelChange = vi.fn();
    renderWithTheme(
      <VehicleCardList
        rows={mockRows}
        rowCount={25}
        paginationModel={{ page: 1, pageSize: 10 }}
        onPaginationModelChange={onPaginationModelChange}
      />,
    );

    // Change rowsPerPage dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const option25 = screen.getByRole('option', { name: '25' });
    fireEvent.click(option25);

    expect(onPaginationModelChange).toHaveBeenCalledWith({
      page: 0,
      pageSize: 25,
    });
  });

  it('passes onOpenDetails callback to individual cards', () => {
    const onOpenDetails = vi.fn();
    renderWithTheme(
      <VehicleCardList
        rows={mockRows}
        rowCount={25}
        onOpenDetails={onOpenDetails}
      />,
    );

    const detailsButton = screen.getByRole('button', {
      name: /view details for 2021 toyota rav4/i,
    });
    fireEvent.click(detailsButton);

    expect(onOpenDetails).toHaveBeenCalledWith(mockRows[0]);
  });
});
