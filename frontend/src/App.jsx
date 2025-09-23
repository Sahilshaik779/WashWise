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
    const token = localStorage.getItem("token");
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

  // This function can be passed as a prop if needed, but the dashboards now handle their own logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRole(null);
    setCurrentPage("landing");
    setSelectedLoginType(null);
  };

  const handleBackToLanding = () => {
    setCurrentPage("landing");
    setSelectedLoginType(null);
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
    // Now, both dashboards are rendered directly and control their own layouts
    if (role === "serviceman") {
      return <ServicemanDashboard />;
    }
    if (role === "customer") {
      return <CustomerDashboard />;
    }
  }

  return null;
}