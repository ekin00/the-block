/* eslint-disable react/prop-types */
import { AppBar, Toolbar, Typography, Button, Stack, Chip, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useUser } from '../../context/UserContext';
import { useDemo } from '../../context/DemoContext';

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isJoined, user } = useUser();
  const { favorites, compare, maxCompare } = useDemo();

  const isDemoBase = location.pathname === '/';
  const isFavorites = location.pathname === '/favorites';
  const isCompare = location.pathname === '/compare';
  const isTrips = location.pathname === '/welcome';

  const displayName = user?.name || (isJoined ? 'Guest' : 'GUEST22');

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {children}
        {/* Brand: The Block [DEMO] */}
        <Box
          onClick={() => navigate('/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
            flexGrow: 1,
            userSelect: 'none'
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
          <Chip
            label="DEMO"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.22)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 20,
              borderRadius: 1,
              letterSpacing: '0.05em',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}
          />
        </Box>

        <Stack direction="row" spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center">
          {/* User greeting right before Inventory */}
          <Typography
            variant="body2"
            sx={{
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
            onClick={() => navigate('/')}
            sx={{
              textTransform: 'none',
              fontWeight: isDemoBase ? 700 : 500,
              borderBottom: isDemoBase ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              bgcolor: isDemoBase ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
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
            onClick={() => navigate('/favorites')}
            startIcon={
              favorites.length > 0 ? (
                <FavoriteIcon sx={{ color: '#ff6b6b', fontSize: '1.1rem !important' }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: 'inherit', opacity: 0.85, fontSize: '1.1rem !important' }} />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: isFavorites ? 700 : 500,
              borderBottom: isFavorites ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              bgcolor: isFavorites ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.18)'
              }
            }}
          >
            Favorites ({favorites.length})
          </Button>

          {/* Compare tab */}
          <Button
            color="inherit"
            onClick={() => navigate('/compare')}
            startIcon={<CompareArrowsIcon sx={{ color: 'inherit', fontSize: '1.1rem !important' }} />}
            sx={{
              textTransform: 'none',
              fontWeight: isCompare ? 700 : 500,
              borderBottom: isCompare ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              bgcolor: isCompare ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.18)'
              }
            }}
          >
            Compare ({compare.length}/{maxCompare})
          </Button>

          {/* My Trips */}
          {isJoined && (
            <Button
              color="inherit"
              onClick={() => navigate('/welcome')}
              sx={{
                textTransform: 'none',
                fontWeight: isTrips ? 700 : 500,
                borderBottom: isTrips ? '2px solid #fff' : '2px solid transparent',
                borderRadius: 0,
                px: { xs: 1, sm: 1.5 },
                py: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                bgcolor: isTrips ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.18)'
                }
              }}
            >
              Demo Profile
            </Button>
          )}

          {!isJoined && (
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              onClick={() => navigate('/welcome')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'none',
                fontSize: '0.8rem',
                ml: 1,
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Get Started
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;