import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('attendanceToken'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('attendanceToken');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid — clear storage
        localStorage.removeItem('attendanceToken');
        localStorage.removeItem('attendanceUser');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('attendanceToken', newToken);
    localStorage.setItem('attendanceUser', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('attendanceToken', newToken);
    localStorage.setItem('attendanceUser', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('attendanceToken');
    localStorage.removeItem('attendanceUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
