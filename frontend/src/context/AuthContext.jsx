import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('picket_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/api/auth/me')
    .then(r => {
      setUser(r.data.user);
    })
    .catch(() => {
      localStorage.removeItem('picket_token');
      setUser(null);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);



  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { user, accessToken } = res.data;
      localStorage.setItem('picket_token', accessToken);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      const { user, accessToken } = res.data;
      localStorage.setItem('picket_token', accessToken);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('picket_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
