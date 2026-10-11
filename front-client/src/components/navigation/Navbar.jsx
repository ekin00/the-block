/* eslint-disable react/prop-types */
import { AppBar, Toolbar, Typography, Button, Stack, Box, Tooltip } from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useUser } from '../../context/UserContext';

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isJoined, user } = useUser();

  const isInventory =
    location.pathname.startsWith('/inventory') ||
    location.pathname.startsWith('/vehicles');
  const isTrips = location.pathname.startsWith('/trips');

  const displayName = user?.name || 'Guest';

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {children}
        {/* Brand: client-route home */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
            flexGrow: 1,
            userSelect: 'none',
            color: 'inherit',
            textDecoration: 'none'
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'inherit'
            }}
          >
            The Block
          </Typography>
        </Box>

        <Stack direction="row" spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center">
          {/* User greeting right before Inventory */}
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
              color: 'inherit',
              whiteSpace: 'nowrap',
              pr: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.95rem' }
            }}
          >
            Hello {displayName}
          </Typography>

          {/* Inventory tab */}
          <Button
            color="inherit"
            component={Link}
            to="/inventory"
            sx={{
              textTransform: 'none',
              fontWeight: isInventory ? 700 : 500,
              borderBottom: isInventory ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              bgcolor: isInventory ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.18)'
              }
            }}
          >
            Inventory
          </Button>

          {/* Favorites tab: disabled until Phase 2 wires persistence */}
          <Tooltip title="Favorites are coming in a later phase">
            <span>
              <Button
                color="inherit"
                disabled
                aria-label="Favorites"
                startIcon={
                  <FavoriteBorderIcon sx={{ opacity: 0.85, fontSize: '1.1rem !important' }} />
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 0,
                  minWidth: 0,
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Favorites</Box>
              </Button>
            </span>
          </Tooltip>

          {/* Compare tab: disabled until Phase 3 wires persistence */}
          <Tooltip title="Compare is coming in a later phase">
            <span>
              <Button
                color="inherit"
                disabled
                aria-label="Compare"
                startIcon={<CompareArrowsIcon sx={{ fontSize: '1.1rem !important' }} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 0,
                  minWidth: 0,
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Compare</Box>
              </Button>
            </span>
          </Tooltip>

        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;