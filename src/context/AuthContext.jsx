/* eslint-disable react-refresh/only-export-components */
// /* eslint-disable react-refresh/only-export-components */
// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from "react";
// import { authService } from "../services/authService";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem("user");
//       const storedToken = localStorage.getItem("token");
//       if (storedUser && storedToken) {
//         setUser(JSON.parse(storedUser));
//       }
//     } catch {
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const login = useCallback(async (credentials) => {
//     const { user, token } = await authService.login(credentials);
    
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(user));

//     setUser(user);

//     return user;
//   }, []);

//   const register = useCallback(async (userData) => {
//     const data = await authService.register(userData);
//     return data.user;
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       await authService.logout();
//     } catch {
//       // Even if the server call fails, clear local state
//     } finally {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       setUser(null);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  // Effect: redirect to login if token is invalid or user is null
  useEffect(() => {
    if (!token || !user) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      setToken(null);
      navigate("/login", { replace: true });
    }
  }, [token, user, navigate]);

  const login = async (data) => {
    const { user: loggedUser, token: jwtToken } = await authService.login(data);
    setUser(loggedUser);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", jwtToken);
    return loggedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
