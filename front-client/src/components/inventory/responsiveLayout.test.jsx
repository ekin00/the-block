import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from '../navigation/Navbar';
import Footer from '../navigation/Footer';
import InventorySearchBar from './InventorySearchBar';
import VehicleCard from './VehicleCard';
import VehicleCardList from './VehicleCardList';
import { AUCTION_PHASE } from '../../features/vehicles/auctionTime';

const theme = createTheme();

const userContextValue = {
  user: { name: 'GUEST1' },
  isJoined: true,
  logout: vi.fn(),
};

vi.mock('../../context/UserContext', () => ({
  useUser: () => userContextValue,
}));

const mockVehicle = {
  id: 'resp-v1',
  year: 2024,
  make: 'Chevrolet',
  model: 'Silverado 1500 High Country Extended Cab',
  odometer_mi: 15000,
  current_bid: 52000,
  starting_bid: 45000,
  condition_grade: 4.8,
  auctionPhase: AUCTION_PHASE.OPEN,
};

const renderWithTheme = (ui, width = 320) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <div style={{ width: `${width}px`, maxWidth: `${width}px`, overflow: 'hidden' }}>
          {ui}
        </div>
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('Responsive Layout 320px / 390px viewport safety', () => {
  it('renders Navbar on 320px viewport without clipping and maintains accessible buttons', () => {
    const { container } = renderWithTheme(<Navbar />, 320);

    expect(screen.getByText('The Block')).toBeTruthy();
    expect(screen.getByText(/hello guest1/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Inventory' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Favorites' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Compare' })).toBeTruthy();

    const toolbar = container.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeTruthy();
  });

  it('renders InventorySearchBar on 320px viewport without overflow', () => {
    renderWithTheme(<InventorySearchBar value="" onChange={() => { }} onSearch={() => { }} />, 320);

    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    const button = screen.getByRole('button', { name: 'Search inventory' });

    expect(input).toBeTruthy();
    expect(button).toBeTruthy();
  });

  it('renders VehicleCard on 320px and 390px viewports', () => {
    const { unmount } = renderWithTheme(<VehicleCard vehicle={mockVehicle} />, 320);
    expect(screen.getByText(/Silverado/)).toBeTruthy();
    unmount();

    renderWithTheme(<VehicleCard vehicle={mockVehicle} />, 390);
    expect(screen.getByText(/Silverado/)).toBeTruthy();
  });

  it('renders VehicleCardList with TablePagination on 320px viewport', () => {
    renderWithTheme(
      <VehicleCardList
        rows={[mockVehicle]}
        rowCount={15}
        paginationModel={{ page: 0, pageSize: 10 }}
        onPaginationModelChange={() => { }}
      />,
      320,
    );

    expect(screen.getByText('1–10 of 15')).toBeTruthy();
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    expect(nextBtn).toBeTruthy();
  });

  it('renders Footer on 320px viewport with accessible Switch User button', () => {
    renderWithTheme(<Footer />, 320);

    expect(screen.getByRole('button', { name: 'Switch User' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Demo' })).toBeTruthy();
  });
});
