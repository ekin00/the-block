/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { buyNow } from '../../services/bidService';
import { formatMoney, vehicleTitle } from '../../features/vehicles/vehicleFormat';

/**
 * Confirms Buy Now. Accepting ends the auction immediately; the buyer wins
 * and the Buy Now price becomes the winning bid (final price). The server is
 * authoritative, so its rejection message is shown verbatim.
 */
const BuyNowDialog = ({ open, vehicle, onClose, onSuccess }) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const price = formatMoney(vehicle.buy_now_price);

  const handleClose = () => {
    if (pending) {
      return;
    }
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await buyNow(vehicle.id);
      setPending(false);
      onSuccess(result);
    } catch (err) {
      setPending(false);
      setError(err?.message || 'Buy Now failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="buy-now-title" aria-describedby="buy-now-description" fullWidth maxWidth="xs">
      <DialogTitle id="buy-now-title">Buy now for {price}?</DialogTitle>
      <DialogContent>
        <DialogContentText id="buy-now-description">
          Buying the {vehicleTitle(vehicle)} now ends the auction immediately. You win the vehicle
          and {price} becomes the final price. This cannot be undone.
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} role="alert">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 2,
          gap: 1,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 } },
        }}
      >
        <Button onClick={handleClose} disabled={pending} sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' } }}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="secondary"
          disabled={pending}
          startIcon={pending ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ minHeight: 44, fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
        >
          {pending ? 'Buying…' : `Confirm Buy Now`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyNowDialog;
