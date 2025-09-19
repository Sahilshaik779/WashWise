import { useState } from "react";
import LoginForm from "./components/LoginForm";
import CustomerDashboard from "./components/CustomerDashboard";
import ServicemanDashboard from "./components/ServicemanDashboard";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRole(null);
  };

  // If no role is set, show login form
  if (!role) {
    return <LoginForm onLogin={setRole} />;
  }

  // Show dashboard based on role
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "white",
        padding: "15px 20px",
        borderBottom: "1px solid #dee2e6",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ margin: "0", color: "#333", fontSize: "24px" }}>
          🧺 Laundry Manager
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ 
            color: "#666", 
            fontSize: "14px",
            padding: "6px 12px",
            backgroundColor: "#e9ecef",
            borderRadius: "20px"
          }}>
            {role === "customer" ? "👤 Customer" : "🔧 Admin"}
          </span>
          <button 
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {role === "customer" ? <CustomerDashboard /> : <ServicemanDashboard />}
      </div>
    </div>
  );
}