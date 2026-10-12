import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a stored user on initial load
    const storedUser = localStorage.getItem('theblock:demo-snapshot:v1:user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('theblock:demo-snapshot:v1:user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('theblock:demo-snapshot:v1:user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('theblock:demo-snapshot:v1:user');
    setUser(null);
  };

  const value = {
    isJoined: !!user,
    user,
    loading,
    login,
    logout
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};