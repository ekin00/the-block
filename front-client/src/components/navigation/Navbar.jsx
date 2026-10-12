/* eslint-disable react/prop-types */
import { AppBar, Toolbar, Typography, Button, Stack, Box, Tooltip } from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useUser } from '../../context/UserContext';
import { useFavorites } from '../../context/FavoritesContext';

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { favoriteCount = 0 } = useFavorites();

  const handleSwitchUser = () => {
    logout();
    navigate('/welcome');
  };

  const isInventory =
    location.pathname.startsWith('/inventory') ||
    location.pathname.startsWith('/vehicles');
  const isFavorites = location.pathname.startsWith('/favorites');

  const displayName = user?.name ? `Hello ${user?.name}` : '';

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {children}
        {/* Brand: client-route home */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'inherit',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
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
            {displayName}
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

          {/* Favorites tab */}
          <Button
            color="inherit"
            component={Link}
            to="/favorites"
            aria-label={favoriteCount > 0 ? `Favorites (${favoriteCount})` : 'Favorites'}
            startIcon={
              favoriteCount > 0 ? (
                <FavoriteIcon sx={{ color: '#ff6b6b', fontSize: '1.1rem !important' }} />
              ) : (
                <FavoriteBorderIcon sx={{ opacity: 0.85, fontSize: '1.1rem !important' }} />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: isFavorites ? 700 : 500,
              borderBottom: isFavorites ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
              minWidth: 0,
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              bgcolor: isFavorites ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.18)'
              },
              '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Favorites{favoriteCount > 0 ? ` (${favoriteCount})` : ''}
            </Box>
          </Button>

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

          {/* Switch User button */}
          <Button
            size="small"
            variant="outlined"
            onClick={handleSwitchUser}
            sx={{
              color: 'inherit',
              borderColor: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              borderRadius: 1,
              '&:hover': {
                borderColor: '#fff',
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Switch User
          </Button>
          
        </Stack>
      </Toolbar>
    </AppBar>

  );
};

export default Navbar;