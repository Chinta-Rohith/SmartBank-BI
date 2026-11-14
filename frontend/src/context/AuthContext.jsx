import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartbank_user');
    const token = localStorage.getItem('smartbank_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('smartbank_user');
        localStorage.removeItem('smartbank_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('smartbank_token', data.access_token);
    const userInfo = {
      email: data.email,
      username: data.username,
      full_name: data.full_name,
      role: data.role
    };
    localStorage.setItem('smartbank_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('smartbank_token');
    localStorage.removeItem('smartbank_user');
    setUser(null);
  };

  const switchDemoRole = async (demoEmail, demoPassword) => {
    return await login(demoEmail, demoPassword);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
