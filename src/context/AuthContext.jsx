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

  const signup = async (email, password, name) => {
    try {
      await axios.post(
        'http://localhost:3001/api/auth/signup',
        { email, password, name },
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











// import axios from 'axios';
// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       // const response = await fetch('http://localhost:3001/api/auth/profile', {
//       //   credentials: 'include',
//       // });
//       const response = await axios.get('http://localhost:3001/api/auth/profile', { withCredentials: true })
//       console.log("in profile")
//       console.log(response.data)
//       if (response.data.success) {
//         console.log("in ok")
//         const userData = response.data
//         setUser(userData);
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     const response = await fetch('http://localhost:3001/api/auth/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//       credentials: 'include',
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message);
//     }

//     const data = await response.json();
//     setUser(data.user);
//   };

//   const logout = async () => {
//     await fetch('http://localhost:3001/api/auth/logout', {
//       method: 'POST',
//       credentials: 'include',
//     });
//     setUser(null);
//   };

//   const signup = async (email, password, name) => {
//     const response = await fetch('http://localhost:3001/api/auth/signup', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password, name }),
//       credentials: 'include',
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message);
//     }
//   };

//   const verifyOTP = async (email, otp) => {
//     const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, otp }),
//       credentials: 'include',
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message);
//     }
//   };

//   const resendOTP = async (email) => {
//     const response = await fetch('http://localhost:3001/api/auth/resend-otp', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email }),
//       credentials: 'include',
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message);
//     }
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     signup,
//     verifyOTP,
//     resendOTP,
//     loading,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


