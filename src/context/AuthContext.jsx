import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Prioritize checking for ID as Cabinet does, regardless of token presence in localStorage for now
      // (assuming axios interceptor handles token if it exists, or API allows it)
      const userId = localStorage.getItem('id');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Optimistically set user from localStorage if available
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }

      if (userId) {
        try {
          const { data } = await axios.get(`/getUserById/${userId}`);
          if (data) {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            console.log("AuthContext: User loaded from server", data);
          }
        } catch (fetchError) {
          console.error("AuthContext: Failed to fetch user data", fetchError);
          // Don't logout here immediately, maybe network error
        }
      } else if (storedToken) {
         // If we have token but no ID, maybe we can't fetch user yet?
         // Or maybe we should try to decode token?
         // For now, let's leave it as is, but ensure loading is set to false.
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, newToken) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    
    // Set default header for axios
    axios.defaults.headers.common['Authorization'] = newToken;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updates) => {
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    role: user?.role || "",
    isAuthenticated: !!token || !!user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
