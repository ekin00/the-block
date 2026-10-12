import { Box, Container, Typography, Link, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Footer = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleSwitchUser = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        px: { xs: 1, sm: 2 },
        mt: 'auto',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '100vw',
        boxSizing: 'border-box',
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 1000,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} --.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Link
              href="/demo/"
              underline="hover"
              sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
            >
              Demo
            </Link>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={handleSwitchUser}
              sx={{
                textTransform: 'none',
                minHeight: 44,
                px: 1.5,
                fontSize: '0.8125rem',
                borderRadius: 1,
              }}
            >
              Switch User
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;