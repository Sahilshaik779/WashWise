import { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [registerRole, setRegisterRole] = useState("customer");

  const handleLogin = async (expectedRole) => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const res = await loginUser(username, password);
      
      // Check if user role matches the expected login type
      if (res.role !== expectedRole) {
        setError(`Invalid credentials for ${expectedRole} login. You are registered as ${res.role}.`);
        return;
      }

      localStorage.setItem("token", res.access_token);
      localStorage.setItem("role", res.role);
      onLogin(res.role);
    } catch (e) {
      setError("Invalid username or password");
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      await registerUser(username, password, registerRole);
      alert(`${registerRole} registered successfully! Please login.`);
      setShowRegister(false);
      setUsername("");
      setPassword("");
      setError("");
    } catch (e) {
      setError("Registration failed - username might already exist");
    }
  };

  if (showRegister) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#f8f9fa"
      }}>
        <div style={{ 
          maxWidth: "400px", 
          padding: "30px", 
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register New User</h2>
          
          <input 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px", 
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          />
          
          <input 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px", 
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          />
          
          <select 
            value={registerRole} 
            onChange={(e) => setRegisterRole(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px", 
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          >
            <option value="customer">Customer</option>
            <option value="serviceman">Serviceman/Admin</option>
          </select>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={handleRegister}
              style={{ 
                flex: 1, 
                padding: "12px", 
                backgroundColor: "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Register
            </button>
            <button 
              onClick={() => {
                setShowRegister(false);
                setUsername("");
                setPassword("");
                setError("");
              }}
              style={{ 
                flex: 1, 
                padding: "12px", 
                backgroundColor: "#6c757d", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Back
            </button>
          </div>
          
          {error && <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      backgroundColor: "#f8f9fa"
    }}>
      <div style={{ 
        maxWidth: "500px", 
        padding: "40px", 
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        textAlign: "center"
      }}>
        <h1 style={{ marginBottom: "30px", color: "#333", fontSize: "28px" }}>
          🧺 Laundry Manager
        </h1>
        
        <input 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "15px", 
            marginBottom: "15px", 
            fontSize: "16px", 
            borderRadius: "6px", 
            border: "1px solid #ddd"
          }}
        />
        
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "15px", 
            marginBottom: "25px", 
            fontSize: "16px", 
            borderRadius: "6px", 
            border: "1px solid #ddd"
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
          <button 
            onClick={() => handleLogin("customer")}
            style={{ 
              padding: "15px", 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "6px", 
              fontSize: "16px", 
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            🛍️ Login as Customer
          </button>
          
          <button 
            onClick={() => handleLogin("serviceman")}
            style={{ 
              padding: "15px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "6px", 
              fontSize: "16px", 
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            🔧 Login as Admin/Serviceman
          </button>
        </div>

        <button 
          onClick={() => setShowRegister(true)}
          style={{ 
            padding: "12px 24px", 
            backgroundColor: "transparent", 
            color: "#007bff", 
            border: "2px solid #007bff", 
            borderRadius: "6px", 
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Don't have an account? Register
        </button>

        {error && (
          <div style={{ 
            marginTop: "20px", 
            padding: "12px", 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            borderRadius: "6px",
            border: "1px solid #f5c6cb"
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}