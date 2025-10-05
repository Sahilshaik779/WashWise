import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import CustomerDashboard from "./components/CustomerDashboard";
import ServicemanDashboard from "./components/ServicemanDashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedLoginType, setSelectedLoginType] = useState(null);
  const [role, setRole] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedRole = localStorage.getItem("role");
    
    if (token && storedRole) {
      setRole(storedRole);
      setCurrentPage("dashboard");
    }
  }, []);

  const handleSelectLoginType = (type) => {
    setSelectedLoginType(type);
    setCurrentPage("auth");
  };

  const handleLogin = (userRole) => {
    setRole(userRole);
    setCurrentPage("dashboard");
  };

  const handleBackToLanding = () => {
    setCurrentPage("landing");
    setSelectedLoginType(null);
  };
  
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    
    setRole(null);
    setCurrentPage("landing");
  };

  // Render based on current page
  if (currentPage === "landing") {
    return <LandingPage onSelectLoginType={handleSelectLoginType} />;
  }

  if (currentPage === "auth") {
    return (
      <AuthPage 
        loginType={selectedLoginType}
        onLogin={handleLogin}
        onBack={handleBackToLanding}
      />
    );
  }

  if (currentPage === "dashboard") {
    // Pass the handleLogout function as a prop to the dashboards
    if (role === "serviceman") {
      return <ServicemanDashboard onLogout={handleLogout} />;
    }
    if (role === "customer") {
      return <CustomerDashboard onLogout={handleLogout} />;
    }
  }

  // Fallback in case something goes wrong
  return <LandingPage onSelectLoginType={handleSelectLoginType} />;
}