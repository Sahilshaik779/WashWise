import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function GoogleCallback({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = getCookie("auth_token");
    const role = getCookie("user_role");

    if (token && role) {
      try {
        // Set the token in localStorage so our API helper (axios) can use it
        localStorage.setItem("access_token", token);
        localStorage.setItem("role", role);

        // Clean up cookies by setting their expiry date to the past
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Trigger the login state change in App.jsx
        onLogin(role);

        // Navigate based on role
        if (role === 'serviceman') {
          navigate('/serviceman-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      } catch (err) {
        console.error('Error during Google login callback:', err);
        setError(true);
        setTimeout(() => navigate('/'), 2000);
      }
    } else {
      // If cookies aren't present, show error and redirect
      setError(true);
      setTimeout(() => navigate('/'), 2000);
    }
  }, [onLogin, navigate]);

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '50px', 
        fontFamily: 'Inter, sans-serif',
        color: '#dc2626'
      }}>
        <h2>Authentication Failed</h2>
        <p>Unable to complete Google login. Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      textAlign: 'center', 
      paddingTop: '50px', 
      fontFamily: 'Inter, sans-serif' 
    }}>
      <h2>Authenticating with Google...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
}