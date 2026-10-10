import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, Fade } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import theblockLogo from '../assets/the_block_truck_start.gif';
import WelcomeForm from '../components/welcome/WelcomeForm';

const Home = ({ initialOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(initialOpen || location.pathname === '/welcome');

  useEffect(() => {
    if (location.pathname === '/welcome') {
      setIsOpen(true);
    } else if (location.pathname === '/') {
      setIsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (location.pathname !== '/welcome') {
      navigate('/welcome');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (location.pathname === '/welcome') {
      navigate('/');
    }
  };

  return (
    <Container maxWidth="md" disableGutters sx={{ px: { xs: 1, sm: 3 } }}>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            mb: { xs: isOpen ? 12 : 4, sm: 4 },
          }}
        >
          <Box
            component="img"
            src={theblockLogo} 
            alt="The Block"
            sx={{
              maxHeight: 500,
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 1,
              transition: 'filter 0.3s ease, opacity 0.3s ease',
              filter: isOpen ? 'blur(3px)' : 'none',
              opacity: isOpen ? 0.7 : 1,
            }}
          />

          {isOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: { xs: 'calc(50% + 72px)', sm: '50%' },
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 'calc(100% - 16px)', sm: 420 },
                maxWidth: 420,
                zIndex: 10,
              }}
            >
              <Fade in={isOpen} timeout={300}>
                <Paper
                  elevation={6}
                  sx={{
                    width: '100%',
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <WelcomeForm onClose={handleClose} />
                </Paper>
              </Fade>
            </Box>
          )}
        </Box>

        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            color: 'secondary.main',
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Welcome to The Block
        </Typography>
        <Typography 
          variant="body1"
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            color: 'secondary.light'
          }}
        >
          Your next adventure begins here. 
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleOpen}
          sx={{ mt: 2 }}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default Home;