import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VehicleCatalogProvider } from '../context/VehicleCatalogContext';
import VehicleDetailsPage from './VehicleDetailsPage';

const mocks = vi.hoisted(() => ({
  getVehicle: vi.fn(),
  listVehicles: vi.fn(),
  buyNow: vi.fn(),
  placeBid: vi.fn(),
  user: { id: 7, name: 'GUEST7' },
}));
vi.mock('../context/UserContext', () => ({ useUser: () => ({ user: mocks.user, isJoined: true }) }));
vi.mock('../services/vehicleService', () => ({
  getVehicle: mocks.getVehicle,
  listVehicles: mocks.listVehicles,
}));
vi.mock('../services/bidService', () => ({ buyNow: mocks.buyNow, placeBid: mocks.placeBid }));

const HOUR = 3_600_000;
const iso = (offsetMs) => new Date(Date.now() + offsetMs).toISOString().replace('Z', '');

const makeVehicle = (overrides = {}) => ({
  id: 'veh-1',
  vin: '1HGCM82633A004352',
  year: 2021,
  make: 'Honda',
  model: 'Civic',
  trim: 'EX',
  body_style: 'sedan',
  exterior_color: 'blue',
  interior_color: 'black',
  engine: '2.0L I4',
  transmission: 'automatic',
  drivetrain: 'FWD',
  odometer_km: 48280,
  odometer_mi: 30000,
  fuel_type: 'gasoline',
  condition_grade: 4.2,
  condition_report: 'Clean interior.',
  damage_notes: ['Scratch on rear bumper'],
  title_status: 'clean',
  city: 'Toronto',
  province: 'ON',
  auction_start: iso(-2 * HOUR),
  auction_end: iso(5 * HOUR),
  starting_bid: 10000,
  reserve_price: 14000,
  buy_now_price: 20000,
  current_bid: 12000,
  bid_count: 3,
  current_winner_id: null,
  images: ['https://example.test/a.jpg', 'https://example.test/b.jpg'],
  selling_dealership: 'Maple Motors',
  lot: 'A-101',
  ...overrides,
});

const renderPage = (id = 'veh-1') =>
  render(
    <VehicleCatalogProvider>
      <MemoryRouter initialEntries={[`/vehicles/${id}`]}>
        <Routes>
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </VehicleCatalogProvider>
  );

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('VehicleDetailsPage', () => {
  it('direct-loads the vehicle and shows every field in miles only', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle());
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: '2021 Honda Civic' })).toBeTruthy();
    expect(mocks.getVehicle).toHaveBeenCalledWith('veh-1', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(mocks.listVehicles).not.toHaveBeenCalled();

    for (const text of [
      '1HGCM82633A004352', 'Sedan', 'Blue', 'Black', '2.0L I4', 'Automatic', 'FWD', 'Gasoline',
      '30,000 mi', 'Clean', 'Maple Motors', 'Toronto, ON', 'Clean interior.', 'Scratch on rear bumper',
    ]) {
      expect(screen.getAllByText(new RegExp(text, 'i')).length).toBeGreaterThan(0);
    }
    expect(document.body.textContent).not.toMatch(/48,?280|\bkm\b/);
    expect(screen.getByRole('button', { name: /place bid/i }).disabled).toBe(false);
    expect(screen.getByText('High bid')).toBeTruthy();
  });

  it('shows not found for a 404', async () => {
    mocks.getVehicle.mockRejectedValue(Object.assign(new Error('Vehicle not found.'), { status: 404 }));
    renderPage('missing');
    expect(await screen.findByText(/Vehicle not found/)).toBeTruthy();
  });

  it('offers Retry after a network error', async () => {
    mocks.getVehicle.mockRejectedValueOnce(new Error('Network down'));
    mocks.getVehicle.mockResolvedValueOnce(makeVehicle());
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { level: 1, name: '2021 Honda Civic' })).toBeTruthy();
    expect(mocks.getVehicle).toHaveBeenCalledTimes(2);
  });

  it('keeps upcoming vehicles viewable with disabled actions and reasons', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle({ auction_start: iso(3 * HOUR), auction_end: iso(9 * HOUR) }));
    renderPage();
    expect(await screen.findByText('Upcoming')).toBeTruthy();
    expect(screen.getByText(/^Bidding opens /)).toBeTruthy();
    expect(screen.getByText(/^Buy Now opens /)).toBeTruthy();
    expect(screen.getByRole('button', { name: /buy now for/i }).disabled).toBe(true);
  });

  it('shows the final price for a closed auction', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle({ auction_end: iso(-HOUR), current_bid: 15000 }));
    renderPage();
    expect(await screen.findByText('Final price')).toBeTruthy();
    expect(screen.getByText('Auction ended. Final price $15,000.')).toBeTruthy();
    expect(screen.getByText('Auction has ended.', { selector: '#buy-now-reason' })).toBeTruthy();
  });

  it('Buy Now ends the auction and makes the buyer the winner at the Buy Now price', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle());
    mocks.buyNow.mockResolvedValue({
      theblock_id: 'veh-1', my_bid: 20000, current_bid: 20000, bid_count: 4,
      status: 'won', reserve_met: true, auction_end: iso(-1000), bought_now: true,
    });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Buy now for $20,000' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/ends the auction immediately/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm Buy Now' }));

    expect(await screen.findByText('You won this vehicle for $20,000 (final price).')).toBeTruthy();
    expect(mocks.buyNow).toHaveBeenCalledWith('veh-1');
    expect(screen.getByText('Final price')).toBeTruthy();
    expect(screen.getByText('Auction ended')).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Buy now for $20,000' }).disabled).toBe(true);
  });

  it('shows the server rejection verbatim when Buy Now fails', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle());
    mocks.buyNow.mockRejectedValue(Object.assign(new Error('Auction has ended.'), { status: 422 }));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Buy now for $20,000' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Buy Now' }));
    const alert = await waitFor(() => within(screen.getByRole('dialog')).getByRole('alert'));
    expect(alert.textContent).toBe('Auction has ended.');
  });
});

describe('VehicleDetailsPage bidding', () => {
  const openBidDialog = async () => {
    fireEvent.click(await screen.findByRole('button', { name: /^Place bid$/i }));
    return screen.getByRole('dialog', { name: 'Place a bid' });
  };

  const enterBid = (dialog, amount) => {
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Your bid' }), {
      target: { value: amount },
    });
  };

  const acceptedBid = {
    theblock_id: 'veh-1', my_bid: 14500.5, current_bid: 14500.5, bid_count: 4,
    status: 'winning', reserve_met: true,
  };

  it('submits a numeric bid once and updates the high bid and winner after acceptance', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle());
    mocks.placeBid.mockResolvedValue(acceptedBid);
    renderPage();
    const dialog = await openBidDialog();
    enterBid(dialog, '$14,500.50');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bid $14,500.50' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(mocks.placeBid).toHaveBeenCalledTimes(1);
    expect(mocks.placeBid).toHaveBeenCalledWith({ theblockId: 'veh-1', amount: 14500.5 });
    expect(screen.getByText('Bid accepted. You are the high bidder at $14,500.50.').closest('[role="alert"]')).not.toBeNull();
    expect(within(screen.getByText('High bid').parentElement).getByText('$14,500.50')).toBeTruthy();
    expect(screen.getByText('You are the high bidder.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Place bid$/i }).disabled).toBe(false);
    expect(mocks.getVehicle).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate submits while the first bid is pending', async () => {
    let resolveBid;
    mocks.getVehicle.mockResolvedValue(makeVehicle());
    mocks.placeBid.mockImplementation(() => new Promise((resolve) => { resolveBid = resolve; }));
    renderPage();
    const dialog = await openBidDialog();
    enterBid(dialog, '14500.50');
    const submit = within(dialog).getByRole('button', { name: 'Bid $14,500.50' });
    act(() => {
      fireEvent.click(submit);
      fireEvent.click(submit);
    });
    expect(mocks.placeBid).toHaveBeenCalledTimes(1);
    expect(within(dialog).getByRole('button', { name: /Placing bid/ }).disabled).toBe(true);
    expect(within(dialog).getByRole('button', { name: 'Cancel' }).disabled).toBe(true);
    expect(within(dialog).getByRole('textbox', { name: 'Your bid' }).disabled).toBe(true);
    fireEvent.click(submit);
    expect(mocks.placeBid).toHaveBeenCalledTimes(1);

    await act(async () => resolveBid(acceptedBid));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(mocks.placeBid).toHaveBeenCalledTimes(1);
  });

  it('shows client validation errors without sending a bid', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle());
    renderPage();
    const dialog = await openBidDialog();
    enterBid(dialog, '12000');
    fireEvent.click(within(dialog).getByRole('button', { name: /^Place bid$/i }));
    expect(within(dialog).getByText('Bid must be higher than the current bid.')).toBeTruthy();
    expect(within(dialog).getByRole('textbox', { name: 'Your bid' }).getAttribute('aria-invalid')).toBe('true');
    expect(mocks.placeBid).not.toHaveBeenCalled();
    expect(mocks.getVehicle).toHaveBeenCalledTimes(1);
  });

  it('keeps a 422 message verbatim while refetching and displaying the updated current bid', async () => {
    const message = 'Bid must be higher than the current bid.';
    mocks.getVehicle.mockResolvedValueOnce(makeVehicle());
    mocks.getVehicle.mockResolvedValue(makeVehicle({ current_bid: 13000, bid_count: 4 }));
    mocks.placeBid.mockRejectedValue(Object.assign(new Error(message), { status: 422 }));
    renderPage();
    const dialog = await openBidDialog();
    const initialFetchCount = mocks.getVehicle.mock.calls.length;
    enterBid(dialog, '12500');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bid $12,500' }));

    const alert = await within(dialog).findByRole('alert');
    expect(alert.textContent).toBe(message);
    await waitFor(() => expect(mocks.getVehicle.mock.calls.length).toBeGreaterThan(initialFetchCount));
    expect(await within(dialog).findByText('2021 Honda Civic · Current bid $13,000 (4 bids)')).toBeTruthy();
    expect(within(dialog).getByRole('alert').textContent).toBe(message);
    expect(mocks.placeBid).toHaveBeenCalledTimes(1);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(within(screen.getByText('High bid').parentElement).getByText('$13,000')).toBeTruthy();
    expect(screen.queryByText(/Bid accepted/)).toBeNull();
  });

  it('fills the amount with current bid plus $500 without submitting', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle());
    renderPage();
    const dialog = await openBidDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: '+$500' }));
    expect(within(dialog).getByRole('textbox', { name: 'Your bid' }).value).toBe('12500');
    expect(within(dialog).getByRole('button', { name: 'Bid $12,500' })).toBeTruthy();
    expect(mocks.placeBid).not.toHaveBeenCalled();
  });

  it('disables Place bid for a closed vehicle', async () => {
    mocks.getVehicle.mockResolvedValue(makeVehicle({ auction_end: iso(-HOUR) }));
    renderPage();
    const button = await screen.findByRole('button', { name: /^Place bid$/i });
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.placeBid).not.toHaveBeenCalled();
  });
});
