// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  // 1. Check if logged in
  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  // 2. Check if role is allowed (e.g., Customer trying to access Admin page)
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their appropriate dashboard
    return <Navigate to={role === 'serviceman' ? '/serviceman-dashboard' : '/customer-dashboard'} replace />;
  }

  // 3. Allow access
  return children;
};

export default ProtectedRoute;