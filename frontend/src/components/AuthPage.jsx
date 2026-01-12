// src/components/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // CHANGED: Import hook
import { loginUser, registerUser, requestPasswordReset } from "../api";
import { WashWiseLogo, IconCustomer, IconAdmin } from "./common/Icons"; // Use shared icons if you created them, otherwise keep local SVGs

// Keep local SVGs if you haven't created the shared file yet
const LocalIconCustomer = () => ( <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const LocalIconAdmin = () => ( <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const LocalWashWiseLogo = () => ( <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logo-gradient)" strokeWidth="1.5"/><path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 10.1642 8.21203 8.6132 9.875 7.82883" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/><defs><linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#81ECEC"/><stop offset="1" stopColor="#74B9FF"/></linearGradient></defs></svg>);


export default function AuthPage({ loginType, onBack }) { // Removed unused onLogin prop
  const navigate = useNavigate(); // CHANGED: Hook for navigation
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle between customer/serviceman if loginType wasn't passed (direct link access)
  const [currentType, setCurrentType] = useState(loginType || 'customer');

  const handleGoogleLogin = () => {
    // This is handled by api.js redirect, so no router change needed here yet
    window.location.href = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/auth/login/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isForgotPassword) {
        await requestPasswordReset(formData.email);
        setMessage("If an account exists, a reset link has been sent.");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // --- LOGIN LOGIC ---
        const data = await loginUser(formData.username, formData.password);
        
        // 1. Save Token
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id);

        // 2. Validate Role (Prevent Serviceman from logging into Customer portal)
        if (data.role !== currentType) {
            setError(`This account is for ${data.role}s, but you are trying to login as a ${currentType}.`);
            localStorage.clear(); // Clear the invalid session
            setLoading(false);
            return;
        }

        // 3. Navigate (THE FIX)
        if (data.role === "serviceman") {
          navigate("/serviceman-dashboard");
        } else {
          navigate("/customer-dashboard");
        }

      } else {
        // --- REGISTER LOGIC ---
        await registerUser(formData.username, formData.email, formData.password, currentType);
        setMessage("Registration successful! Please log in.");
        setIsLogin(true);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="background-blur" />
      
      <div className="auth-card">
        <button className="back-btn" onClick={onBack}>← Back</button>
        
        <div className="header">
            <div className="icon-wrapper">
                {currentType === 'customer' ? <LocalIconCustomer /> : <LocalIconAdmin />}
            </div>
            <h2>{currentType === 'customer' ? 'Customer' : 'Admin'} Portal</h2>
            <p>{isForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && !isForgotPassword && (
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
          )}
          
          {(isForgotPassword) && (
             <div className="input-group">
              <label>Enter your Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
          )}

          {(!isForgotPassword) && (
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required 
              />
            </div>
          )}

          {!isForgotPassword && (
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processing..." : (isForgotPassword ? "Send Reset Link" : (isLogin ? "Login" : "Register"))}
          </button>
        </form>

        {!isForgotPassword && (
            <>
                <div className="divider">or</div>
                <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                    <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                </button>
            </>
        )}

        <div className="toggle-form multi-link">
            {!isForgotPassword ? (
                <>
                    <button onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Need an account? Register" : "Have an account? Login"}
                    </button>
                    {isLogin && <button onClick={() => setIsForgotPassword(true)}>Forgot Password?</button>}
                </>
            ) : (
                <button onClick={() => setIsForgotPassword(false)} style={{width: '100%'}}>Back to Login</button>
            )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap');
        body { margin: 0; font-family: 'Inter', sans-serif; background-color: #1f2430; color: #fff; }
      `}</style>
      <style jsx>{`
        .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 20px; }
        .background-blur { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(129, 236, 236, 0.15) 0%, rgba(36, 44, 61, 0.95) 70%); z-index: 1; pointer-events: none; }
        
        .auth-card { width: 100%; max-width: 420px; position: relative; z-index: 3; padding: 50px 40px; background-color: rgba(36, 44, 61, 0.55); backdrop-filter: blur(16px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 25px 50px rgba(0,0,0,0.3); color: #fff; }
        .header { text-align: center; margin-bottom: 40px; }
        .icon-wrapper { width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
        .header h2 { font-size: 2rem; font-weight: 700; margin: 0 0 10px; }
        .header p { color: rgba(255,255,255,0.6); margin: 0; }
        .input-group { margin-bottom: 25px; }
        .input-group label { display: block; margin-bottom: 8px; font-weight: 500; color: rgba(255, 255, 255, 0.8); }
        .input-field { width: 100%; padding: 15px; font-size: 1rem; background-color: rgba(0,0,0, 0.2); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: #fff; transition: all 0.3s ease; box-sizing: border-box; }
        .input-field:focus { outline: none; border-color: #81ECEC; background-color: rgba(0,0,0, 0.3); }
        .submit-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #81ECEC, #74B9FF); border: none; border-radius: 10px; color: #1f2430; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(129, 236, 236, 0.4); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .back-btn { position: absolute; top: 20px; left: 20px; background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 0.9rem; transition: color 0.2s; }
        .back-btn:hover { color: #fff; }
        
        .divider { display: flex; align-items: center; text-align: center; color: rgba(255,255,255,0.4); margin: 25px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid rgba(255,255,255,0.2); }
        .divider:not(:empty)::before { margin-right: .25em; }
        .divider:not(:empty)::after { margin-left: .25em; }
        .google-btn { display: flex; align-items: center; justify-content: center; gap: 15px; width: 100%; padding: 12px; background-color: #fff; color: #444; border-radius: 10px; font-weight: 600; text-decoration: none; transition: background-color 0.2s ease; margin-bottom: 25px; border: none; cursor: pointer;}
        .google-btn:hover { background-color: #f1f1f1; }
        .google-btn svg { width: 24px; height: 24px; }
        .toggle-form { text-align: center; }
        .toggle-form button { background: none; border: none; color: #81ECEC; font-size: 0.95rem; font-weight: 500; cursor: pointer; }
        .toggle-form.multi-link { display: flex; justify-content: space-between; }
        .error-message { background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #ffadad; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; text-align: center; }
        .success-message { background: rgba(46, 204, 113, 0.2); border: 1px solid #2ecc71; color: #a3e4d7; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; text-align: center; }

        @media (max-width: 480px) {
            .auth-card { padding: 40px 25px; }
            .header h2 { font-size: 1.75rem; }
        }
      `}</style>
    </div>
  );
}