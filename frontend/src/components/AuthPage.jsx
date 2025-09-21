import { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function AuthPage({ loginType, onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const isCustomer = loginType === "customer";
  const title = isCustomer ? "Customer Login" : "Admin Login";
  const icon = isCustomer ? "👤" : "🔧";
  const color = isCustomer ? "#28a745" : "#007bff";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginUser(username, password);
      
      if (res.role !== loginType) {
        setError(`Invalid credentials for ${loginType} login. You are registered as ${res.role}.`);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.access_token);
      localStorage.setItem("role", res.role);
      onLogin(res.role);
    } catch (e) {
      setError("Invalid username or password");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(username, password, loginType);
      alert(`${loginType} registered successfully! Please login.`);
      setShowRegister(false);
      setUsername("");
      setPassword("");
    } catch (e) {
      setError("Registration failed - username might already exist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: "450px",
        width: "100%",
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        position: "relative"
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#666",
            padding: "5px",
            borderRadius: "50%",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
        >
          ←
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ 
            fontSize: "3rem", 
            marginBottom: "15px",
            color: color 
          }}>
            {icon}
          </div>
          <h2 style={{
            color: "#333",
            fontSize: "1.8rem",
            fontWeight: "600",
            marginBottom: "10px"
          }}>
            {showRegister ? `${title.replace('Login', 'Register')}` : title}
          </h2>
          <p style={{
            color: "#666",
            fontSize: "1rem",
            margin: "0"
          }}>
            {showRegister 
              ? `Create your ${isCustomer ? 'customer' : 'admin'} account`
              : `Sign in to your ${isCustomer ? 'customer' : 'admin'} account`
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={showRegister ? handleRegister : handleLogin}>
          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#333"
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "15px",
                fontSize: "1rem",
                border: "2px solid #e9ecef",
                borderRadius: "10px",
                transition: "border-color 0.2s ease",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = color}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#333"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "15px",
                fontSize: "1rem",
                border: "2px solid #e9ecef",
                borderRadius: "10px",
                transition: "border-color 0.2s ease",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = color}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "1.1rem",
              fontWeight: "600",
              backgroundColor: loading ? "#6c757d" : color,
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              marginBottom: "20px"
            }}
          >
            {loading ? "⏳ Processing..." : (showRegister ? "Create Account" : "Sign In")}
          </button>

          {/* Toggle Register/Login */}
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => {
                setShowRegister(!showRegister);
                setError("");
                setUsername("");
                setPassword("");
              }}
              style={{
                background: "none",
                border: "none",
                color: color,
                fontSize: "0.95rem",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {showRegister 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Register"
              }
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "8px",
            border: "1px solid #f5c6cb",
            fontSize: "0.9rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}