import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminEventsPage from './components/admin/AdminEventsPage';
import Users from './pages/Users';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import UnauthorizedPage from './components/shared/UnauthorizedPage';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected admin routes */}
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminEventsPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to login if not authenticated */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch all other routes */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ErrorBoundary>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 