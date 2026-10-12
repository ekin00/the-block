/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material';
import { placeBid } from '../../services/bidService';
import {
  QUICK_INCREMENTS,
  describeBidMinimum,
  incrementedAmount,
  isStaleBidError,
  validateBid,
} from '../../features/vehicles/bidValidation';
import { formatMoney, vehicleTitle } from '../../features/vehicles/vehicleFormat';

/**
 * Places a real bid. Validation mirrors the backend; the server stays
 * authoritative, so success shows only after a 201 and rejections show the
 * server message verbatim. A 404/422 asks the page to refetch the vehicle
 * (onStale) while the message stays visible here.
 */
const BidDialog = ({ open, vehicle, canBid, unavailableReason, onClose, onSuccess, onStale }) => {
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState(null);
  // Guards double submits that land before the pending re-render.
  const inFlight = useRef(false);

  const validation = validateBid(amount, vehicle);
  const showFieldError = touched && !validation.ok;
  const hasBids = vehicle.bid_count > 0 && Number.isFinite(vehicle.current_bid);

  const reset = () => {
    setAmount('');
    setTouched(false);
    setServerError(null);
  };

  const handleClose = () => {
    if (pending) {
      return;
    }
    onClose();
  };

  const handleChange = (event) => {
    setAmount(event.target.value);
    setServerError(null);
  };

  const handleIncrement = (increment) => {
    setAmount(incrementedAmount(vehicle, increment));
    setTouched(true);
    setServerError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (!validation.ok || !canBid || inFlight.current) {
      return;
    }
    inFlight.current = true;
    setPending(true);
    setServerError(null);
    try {
      const result = await placeBid({ theblockId: vehicle.id, amount: validation.amount });
      reset();
      onSuccess(result);
    } catch (err) {
      setServerError(err?.message || 'Your bid could not be placed. Please try again.');
      if (isStaleBidError(err)) {
        onStale?.();
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="bid-title"
      aria-describedby="bid-description"
      fullWidth
      maxWidth="xs"
      slotProps={{
        transition: { onExited: reset },
        paper: { component: 'form', onSubmit: handleSubmit, noValidate: true },
      }}
    >
      <DialogTitle id="bid-title">Place a bid</DialogTitle>
      <DialogContent>
        <DialogContentText id="bid-description" sx={{ mb: 2 }}>
          {vehicleTitle(vehicle)} · {hasBids
            ? `Current bid ${formatMoney(vehicle.current_bid)} (${vehicle.bid_count} ${vehicle.bid_count === 1 ? 'bid' : 'bids'})`
            : `No bids yet. Starting bid ${formatMoney(vehicle.starting_bid)}`}
        </DialogContentText>

        <TextField
          autoFocus
          fullWidth
          id="bid-amount"
          label="Your bid"
          name="amount"
          value={amount}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={pending || !canBid}
          error={showFieldError}
          helperText={showFieldError ? validation.error : describeBidMinimum(vehicle)}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
            htmlInput: { inputMode: 'decimal', autoComplete: 'off', 'aria-describedby': 'bid-amount-helper-text bid-increment-note' },
          }}
        />

        <Box
          role="group"
          aria-label="Quick amounts"
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, mt: 2 }}
        >
          {QUICK_INCREMENTS.map((increment) => (
            <Button
              key={increment}
              variant="outlined"
              onClick={() => handleIncrement(increment)}
              disabled={pending || !canBid}
              sx={{ minHeight: 44, textTransform: 'none', px: 0.5 }}
            >
              +{formatMoney(increment)}
            </Button>
          ))}
        </Box>
        <DialogContentText id="bid-increment-note" variant="caption" sx={{ display: 'block', mt: 1 }}>
          Quick amounts add to the {hasBids ? 'current' : 'starting'} bid. They are shortcuts, not minimums.
        </DialogContentText>

        {!canBid && unavailableReason && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {unavailableReason}
          </Alert>
        )}
        {serverError && (
          <Alert severity="error" sx={{ mt: 2 }} role="alert">
            {serverError}
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
          type="submit"
          variant="contained"
          disabled={pending || !canBid}
          startIcon={pending ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ minHeight: 44, fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
        >
          {pending
            ? 'Placing bid…'
            : validation.ok
              ? `Bid ${formatMoney(validation.amount)}`
              : 'Place bid'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BidDialog;
