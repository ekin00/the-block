/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from '../../context/UserContext';

const RESERVED_NAME_PATTERN = /^guest\d*$/i;
const RESERVED_NAME_MESSAGE =
  "😄 'GUEST' names are saved for our walk-in adventurers — pick another name!";

const WelcomeForm = ({ onClose }) => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [name, setName] = useState('');
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setName(e.target.value);
    // Clear messages as soon as the user edits the field
    setWarning('');
    setError('');
  };

  const handleJoinAndNavigate = async (targetPath) => {
    const trimmedName = name.trim();

    // Keep the original reserved-name rule without contacting the server.
    if (trimmedName && RESERVED_NAME_PATTERN.test(trimmedName)) {
      setWarning(RESERVED_NAME_MESSAGE);
      return;
    }

    setIsLoading(true);
    setWarning('');
    setError('');

    try {
      login({ id: 'snapshot-user', name: trimmedName || 'GUEST22' });
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error('Join error:', err);
      if ((err.message || '').toLowerCase().includes('reserved')) {
        setWarning(RESERVED_NAME_MESSAGE);
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseInventory = () => {
    const trimmedName = name.trim();
    if (trimmedName && !RESERVED_NAME_PATTERN.test(trimmedName)) {
      login({ name: trimmedName });
    }
    navigate('/');
  };

  /*  use this to redirect to demo or original dashboard */
  const handleSubmit = (e) => {
    e.preventDefault();
    handleBrowseInventory();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'relative'
      }}
    >
      {onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        textAlign="center"
        sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 700,
          px: 3 // leaves room so close button never overlaps header text
        }}
      >
        Welcome to The Block!
      </Typography>

      <Typography variant="body2" textAlign="center" color="text.secondary">
        Enter your name for this demo, or leave it blank and we&apos;ll
        set you up as a guest.
      </Typography>

      {warning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warning}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Your name"
        name="name"
        value={name}
        onChange={handleChange}
        disabled={isLoading}
        inputProps={{ maxLength: 50 }}
        autoFocus
      />

      <Button
        type="button"
        variant="contained"
        color="primary"
        size="large"
        onClick={handleBrowseInventory}
        sx={{ mt: 1 }}
      >
        Browse Inventory
      </Button>

      <Button
        type="button"
        variant="contained"
        color="primary"
        size="large"
        disabled={isLoading}
        onClick={() => handleJoinAndNavigate('/')}
      >
        {isLoading ? 'Joining...' : 'Join Demo'}
      </Button>
    </Box>
  );
};

export default WelcomeForm;
