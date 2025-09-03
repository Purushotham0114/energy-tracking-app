import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/auth/profile', {
        withCredentials: true,
      });
      if (response.data.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        'http://localhost:3001/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      // setUser(true);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:3001/api/auth/logout',
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const signup = async (email, password, name, phone) => {
    try {
      await axios.post(
        'http://localhost:3001/api/auth/signup',
        { email, password, name, phone },
        { withCredentials: true }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      await axios.post(
        'http://localhost:3001/api/auth/verify-otp',
        { email, otp },
        { withCredentials: true }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const resendOTP = async (email) => {
    try {
      await axios.post(
        'http://localhost:3001/api/auth/resend-otp',
        { email },
        { withCredentials: true }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'OTP resend failed');
    }
  };

  const value = {
    user,
    login,
    logout,
    signup,
    verifyOTP,
    resendOTP,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

