import Home from '../pages/Home';
import WelcomePage from '../pages/WelcomePage';

import InventoryPage from '../pages/InventoryPage';
import VehicleDetailsPage from '../pages/VehicleDetailsPage';
import FavoritesPage from '../pages/FavoritesPage';

export const publicRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
];

export const protectedRoutes = [
  {
    path: '/inventory',
    element: <InventoryPage />,
  },
  {
    path: '/favorites',
    element: <FavoritesPage />,
  },
  {
    path: '/vehicles/:id',
    element: <VehicleDetailsPage />,
  }

];