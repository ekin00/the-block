/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DemoContext = createContext(null);
export const MAX_COMPARE = 3;

export const DemoProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('demo_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compare, setCompare] = useState(() => {
    try {
      const saved = localStorage.getItem('demo_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('demo_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('demo_compare', JSON.stringify(compare));
    } catch (e) {
      console.error('Failed to save compare to localStorage', e);
    }
  }, [compare]);

  const toggleFavorite = useCallback((vehicleId) => {
    setFavorites((current) =>
      current.includes(vehicleId)
        ? current.filter((id) => id !== vehicleId)
        : [...current, vehicleId]
    );
  }, []);

  const toggleCompare = useCallback((vehicleId) => {
    setCompare((current) => {
      if (current.includes(vehicleId)) {
        setNotice('');
        return current.filter((id) => id !== vehicleId);
      }
      if (current.length >= MAX_COMPARE) {
        setNotice(`You can compare up to ${MAX_COMPARE} vehicles. Remove one before adding another.`);
        return current;
      }
      setNotice('');
      return [...current, vehicleId];
    });
  }, []);

  const clearNotice = useCallback(() => setNotice(''), []);

  const value = {
    favorites,
    compare,
    notice,
    toggleFavorite,
    toggleCompare,
    clearNotice,
    maxCompare: MAX_COMPARE
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    // Graceful fallback if used outside DemoProvider
    return {
      favorites: [],
      compare: [],
      notice: '',
      toggleFavorite: () => {},
      toggleCompare: () => {},
      clearNotice: () => {},
      maxCompare: MAX_COMPARE
    };
  }
  return context;
};
