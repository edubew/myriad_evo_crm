import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Router,
} from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout/AppLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Calendar from "../pages/Calendar/Calendar";
import Clients from "../pages/Clients/Clients";
import ClientDetail from "../pages/Clients/ClientDetail";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ProtectedRoute from "./ProtectedRoute";
import Projects from "../pages/Projects/Projects";
import ProjectDetail from "../pages/Projects/ProjectDetail";

function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route
                      index
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="clients/:id" element={<ClientDetail />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:id" element={<ProjectDetail />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
