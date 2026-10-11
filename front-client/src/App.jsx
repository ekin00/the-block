import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { UserProvider, useUser } from './context/UserContext';
import { VehicleCatalogProvider } from './context/VehicleCatalogContext';
import { setOnUnauthorized } from './services/api';
import { publicRoutes, protectedRoutes } from './routes/routes';
import './App.css';

// Bridges the API client's 401 handling into React: clears identity state
// and routes to the join screen instead of a hard page reload.
const UnauthorizedBridge = () => {
  const { logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      navigate('/welcome', { replace: true });
    });
    return () => setOnUnauthorized(null);
  }, [logout, navigate]);

  return null;
};

function App() {
  return (
    <UserProvider>
      <VehicleCatalogProvider>
        <Router>
          <UnauthorizedBridge />
          <MainLayout>
            <Routes>
              {publicRoutes.map((route) => (
                <Route 
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
              {protectedRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute>
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              ))}
            </Routes>
          </MainLayout>
        </Router>
      </VehicleCatalogProvider>
    </UserProvider>
  );

}

export default App;