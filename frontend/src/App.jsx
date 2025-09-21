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
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "white",
          padding: "15px 30px",
          borderBottom: "1px solid #dee2e6",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <h1 style={{ 
                margin: "0", 
                color: "#333", 
                fontSize: "1.5rem",
                fontWeight: "600"
              }}>
                🧺 Laundry Manager
              </h1>
              <span style={{
                padding: "6px 12px",
                backgroundColor: role === "customer" ? "#28a745" : "#007bff",
                color: "white",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}>
                {role === "customer" ? "👤 Customer" : "🔧 Admin"}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#c82333"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#dc3545"}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px"
        }}>
          {role === "customer" ? (
            <CustomerDashboard />
          ) : (
            <ServicemanDashboard />
          )}
        </main>
      </div>
    );
  }

  return null;
}