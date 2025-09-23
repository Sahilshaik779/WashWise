import { useState } from "react";
import { loginUser, registerUser } from "../api";

// Re-using the same high-quality SVG icons from the Landing Page
const IconCustomer = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconAdmin = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default function AuthPage({ loginType, onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const isCustomer = loginType === "customer";
  
  // Set theme colors based on loginType for dynamic styling
  const theme = {
    color: isCustomer ? "#81ecec" : "#a29bfe",
    gradientStart: isCustomer ? "#2dd4bf" : "#818cf8",
    gradientEnd: isCustomer ? "#34d399" : "#c084fc",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return setError("Please enter username and password");
    setLoading(true);
    setError("");
    try {
      const res = await loginUser(username, password);
      if (res.role !== loginType) {
        setError(`Access denied. You are registered as a ${res.role}.`);
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
    if (!username || !password) return setError("Please enter username and password");
    setLoading(true);
    setError("");
    try {
      await registerUser(username, password, loginType);
      alert(`${loginType} registered successfully! Please login.`);
      setShowRegister(false);
      setUsername("");
      setPassword("");
    } catch (e) {
      setError("Registration failed. Username may already exist.");
    } finally {
      setLoading(false);
    }
  };
  
  const title = isCustomer ? "Customer Portal" : "Admin Portal";

  return (
    <div className="auth-container">
      <div className="background-image-container" />
      <div className="background-overlay" />

      <div className="auth-card" style={{ '--theme-color': theme.color }}>
        <button onClick={onBack} className="back-button">←</button>

        <div className="header">
          <div className="icon-wrapper">
            {isCustomer ? <IconCustomer /> : <IconAdmin />}
          </div>
          <h2>{showRegister ? `Register ${isCustomer ? 'Customer' : 'Admin'}` : title}</h2>
          <p>{showRegister ? `Create your new account` : `Sign in to continue`}</p>
        </div>

        <form onSubmit={showRegister ? handleRegister : handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
            style={{ 
              background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`
            }}
          >
            {loading ? "Processing..." : (showRegister ? "Create Account" : "Sign In")}
          </button>

          <div className="toggle-form">
            <button type="button" onClick={() => setShowRegister(!showRegister)}>
              {showRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap');
        
        body { 
          margin: 0; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #242c3d, #1f2430);
        }
      `}</style>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .background-overlay { /* Consistent overlay */
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, rgba(36, 44, 61, 0.3) 0%, rgba(36, 44, 61, 0.6) 90%);
          z-index: 2;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 3;
          padding: 50px 40px;
          background-color: rgba(36, 44, 61, 0.55);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            inset 0 0 0 1px rgba(255, 255, 255, 0.1),
            0 25px 50px rgba(0,0,0,0.3);
          color: #fff;
        }
        
        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 1.5rem;
          cursor: pointer;
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .back-button:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1);
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .icon-wrapper {
          color: var(--theme-color);
          margin-bottom: 15px;
        }
        .header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 10px;
        }
        .header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .input-group {
          margin-bottom: 25px;
        }
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }
        .input-field {
          width: 100%;
          padding: 15px;
          font-size: 1rem;
          background-color: rgba(0,0,0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: #fff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          outline: none;
        }
        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .input-field:focus {
          border-color: var(--theme-color);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-color) 30%, transparent);
        }

        .submit-button {
          width: 100%;
          padding: 15px;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 25px;
          box-shadow: 0 10px 20px -5px color-mix(in srgb, var(--theme-color) 40%, black);
        }
        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .submit-button:disabled {
          background: #495057;
          cursor: not-allowed;
          box-shadow: none;
        }

        .toggle-form {
          text-align: center;
        }
        .toggle-form button {
          background: none;
          border: none;
          color: var(--theme-color);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
        }

        .error-message {
          margin-top: 20px;
          padding: 15px;
          background-color: rgba(217, 48, 77, 0.2);
          color: #f8b4c0;
          border-radius: 8px;
          border: 1px solid rgba(217, 48, 77, 0.5);
          font-size: 0.9rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}