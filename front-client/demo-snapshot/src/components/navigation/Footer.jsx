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
        py: 2,
        px: 2,
        mt: 'auto',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 1000
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} --.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={handleSwitchUser}
              sx={{
                textTransform: 'none',
                py: 0.25,
                px: 1.5,
                fontSize: '0.8125rem',
                borderRadius: 1
              }}
            >
              Switch User
            </Button>
            <Link href="https://gh.io/gfb-copilot" alt="GitHub Copilot" target="_blank" color="text.secondary" underline="hover">
              Built with GitHub Copilot 🤖   ggggggggggggggg
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;