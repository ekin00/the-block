import { Box, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isDemo = location.pathname !== '/welcome';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      position: 'relative'
    }}>
      <Navbar />
      <Container 
        component="main" 
        maxWidth={isDemo ? false : 'lg'}
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          width: '100%',
          py: 3,
          px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
          mb: 10,
        }}
      >
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default MainLayout;
