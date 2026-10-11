/* eslint-disable react/prop-types */
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isJoined, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!isJoined) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
