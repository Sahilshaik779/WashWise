import { useState, useEffect } from "react";
import { resetPassword } from "../api";

export default function ResetPasswordPage({ onResetSuccess }) {
  const [token, setToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("No reset token found in URL. The link may be invalid or expired.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!token) {
      return setError("Missing reset token.");
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await resetPassword(token, newPassword);
      setMessage(res.data.message + " You will be redirected to the login page shortly.");
      setTimeout(() => {
        onResetSuccess();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. The token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ '--theme-color': '#81ecec' }}>
        <div className="header">
          <h2>Set New Password</h2>
        </div>
        
        {message ? (
          <div className="success-message">
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" required />
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="submit-button" style={{ background: `linear-gradient(135deg, #2dd4bf, #34d399)` }} disabled={loading || !token}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {error && <div className="error-message" style={{marginTop: '20px'}}>{error}</div>}
      </div>
       <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap');
        body { margin: 0; font-family: 'Inter', sans-serif; background: #1f2430; }
        * { box-sizing: border-box; }
      `}</style>
      <style jsx>{`
        .auth-container { min-height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden; }
        .auth-card { width: 100%; max-width: 420px; position: relative; z-index: 3; padding: 50px 40px; background-color: rgba(36, 44, 61, 0.55); backdrop-filter: blur(16px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 25px 50px rgba(0,0,0,0.3); color: #fff; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h2 { font-size: 2rem; font-weight: 700; margin: 0 0 10px; }
        .input-group { margin-bottom: 25px; }
        .input-group label { display: block; margin-bottom: 8px; font-weight: 500; color: rgba(255, 255, 255, 0.8); }
        .input-field { width: 100%; padding: 15px; font-size: 1rem; background-color: rgba(0,0,0, 0.2); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: #fff; transition: border-color 0.2s ease, box-shadow 0.2s ease; outline: none; }
        .submit-button { width: 100%; padding: 15px; font-size: 1.1rem; font-weight: 600; color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 25px; box-shadow: 0 10px 20px -5px color-mix(in srgb, var(--theme-color) 40%, black); }
        .error-message { margin-top: 20px; padding: 15px; background-color: rgba(217, 48, 77, 0.2); color: #f8b4c0; border-radius: 8px; border: 1px solid rgba(217, 48, 77, 0.5); font-size: 0.9rem; text-align: center; }
        .success-message { text-align: center; color: #d1fae5; }
      `}</style>
    </div>
  );
}