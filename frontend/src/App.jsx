// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import CustomerDashboard from "./components/CustomerDashboard";
import ServicemanDashboard from "./components/ServicemanDashboard";
import GoogleCallback from "./components/GoogleCallback";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from 'react';

export default function App() {
  // We can pass this state to AuthPage to know which tab to show
  // Alternatively, you could use URL params like /auth?type=customer
  const [loginType, setLoginType] = useState('customer');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage onSelectLoginType={setLoginType} />} />
        
        <Route path="/auth" element={
          <AuthPage 
            loginType={loginType} 
            onLogin={() => {}} // Dashboard handles its own data fetching now
            onBack={() => window.history.back()} 
          />
        } />
        
        <Route path="/google-callback" element={<GoogleCallback onLogin={() => {}} />} />
        <Route path="/reset-password" element={<ResetPasswordPage onResetSuccess={() => window.location.href = '/auth'} />} />

        {/* Protected Routes */}
        <Route 
          path="/customer-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/serviceman-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['serviceman']}>
              <ServicemanDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all: Redirect unknown URLs to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}