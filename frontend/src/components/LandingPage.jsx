import { useState } from "react";

const IconCustomer = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const IconAdmin = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
const WashWiseLogo = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logo-gradient)" strokeWidth="1.5"/>
      <path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 10.1642 8.21203 8.6132 9.875 7.82883" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <defs><linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#81ECEC"/><stop offset="1" stopColor="#74B9FF"/></linearGradient></defs>
    </svg>
);


export default function LandingPage({ onSelectLoginType }) {
  const [hoveredPortal, setHoveredPortal] = useState(null);

  const portalBaseStyle = {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 30px",
    borderRadius: "20px", cursor: "pointer", position: "relative", overflow: "hidden", 
    backgroundColor: "rgba(36, 44, 61, 0.55)", 
    backdropFilter: "blur(12px)",
    textAlign: "center",
    transition: "transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
  };

  const portalHoverStyle = {
    transform: "scale(1.03) translateY(-5px)",
    backgroundColor: "rgba(36, 44, 61, 0.7)",
    borderColor: "rgba(129, 236, 236, 0.5)"
  };

  return (
    <div className="landing-container">
      <div className="background-glow-effect" /> 

      <div className="background-image-container" />
      <div className="background-overlay" />

      <main className="content-wrapper">
        <header className="hero-section">
          <div className="logo-container">
            <WashWiseLogo />
          </div>
          <h1 className="hero-title">
            Welcome to <span className="brand-name">WashWise</span>
          </h1>
          <p className="hero-subtitle">
            Intelligent care for modern living. Experience a new standard for your cherished garments.
          </p>
        </header>

        <section className="portal-selection">
          {/* Customer Portal Card */}
          <div
            onClick={() => onSelectLoginType("customer")}
            onMouseEnter={() => setHoveredPortal("customer")}
            onMouseLeave={() => setHoveredPortal(null)}
            style={{...portalBaseStyle, ...(hoveredPortal === "customer" ? portalHoverStyle : {})}}
          >
            <div className="portal-icon-wrapper customer-icon"><IconCustomer /></div>
            <h2 className="portal-title">Customer Portal</h2>
            <p className="portal-description">Access your personal wardrobe, track orders, and manage preferences.</p>
            <div className={portal-glow ${hoveredPortal === 'customer' ? 'active' : ''}} />
          </div>

          {/* Admin Portal Card */}
          <div
            onClick={() => onSelectLoginType("serviceman")}
            onMouseEnter={() => setHoveredPortal("admin")}
            onMouseLeave={() => setHoveredPortal(null)}
            style={{...portalBaseStyle, ...(hoveredPortal === "admin" ? portalHoverStyle : {})}}
          >
            <div className="portal-icon-wrapper admin-icon"><IconAdmin /></div>
            <h2 className="portal-title">Admin Portal</h2>
            <p className="portal-description">Oversee operations, manage services, and access the dashboard.</p>
            <div className={portal-glow ${hoveredPortal === 'admin' ? 'active' : ''}} />
          </div>
        </section>
        
        <footer className="landing-footer">
          Need assistance? Contact <a href="mailto:support@washwise.com">support@washwise.com</a>
        </footer>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        
        body { 
          margin: 0; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #fff;
          background: linear-gradient(135deg, #242c3d, #1f2430);
          background-size: 400% 400%;
          animation: animateGradient 15s ease infinite;
        }

        @keyframes animateGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <style jsx>{`
        .landing-container {
          min-height: 100vh; width: 100vw; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; padding: 40px 20px; box-sizing: border-box;
        }

        .background-glow-effect {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 1200px;
            height: 1200px;
            background: radial-gradient(circle, rgba(129, 236, 236, 0.1) 0%, rgba(116, 185, 255, 0.05) 50%, transparent 70%);
            transform: translate(-50%, -50%) scale(1);
            animation: pulseGlow 20s ease-in-out infinite alternate;
            z-index: 0;
            pointer-events: none;
        }

        @keyframes pulseGlow {
            0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.8; }
        }
            
        @keyframes kenBurns {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-20px, 15px); }
        }

        .background-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, rgba(36, 44, 61, 0.5) 0%, rgba(36, 44, 61, 0.75) 80%);
          z-index: 2;
        }

        .content-wrapper {
          position: relative; z-index: 3; width: 100%; max-width: 1100px;
          display: flex; flex-direction: column; align-items: center;
          animation: fadeIn 1.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-section { text-align: center; margin-bottom: 60px; }
        .logo-container { margin-bottom: 20px; }
        .hero-title {
          font-size: clamp(2.8rem, 6vw, 4.2rem); font-weight: 800; color: #ffffff;
          margin: 0 0 15px; line-height: 1.2; letter-spacing: -1.5px;
          text-shadow: 0 4px 30px rgba(0,0,0,0.5);
        }
        
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          background: linear-gradient(45deg, #81ECEC, #74B9FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        
        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.2rem); font-weight: 300; color: rgba(255, 255, 255, 0.75);
          max-width: 600px; line-height: 1.7; margin: 0 auto;
        }
        .portal-selection { display: flex; gap: 40px; width: 100%; max-width: 900px; }
        .portal-icon-wrapper {
          width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; margin-bottom: 25px; transition: background-color 0.3s ease;
        }
        .customer-icon { background-color: rgba(129, 236, 236, 0.1); color: #81ecec; }
        .admin-icon { background-color: rgba(162, 155, 254, 0.1); color: #a29bfe; }
        .portal-title { font-size: 1.6rem; font-weight: 600; color: #fff; margin: 0 0 10px; }
        .portal-description { font-size: 0.95rem; font-weight: 400; color: rgba(255, 255, 255, 0.6); line-height: 1.6; max-width: 300px; }
        .portal-glow {
          position: absolute; top: 50%; left: 50%; width: 250%; height: 250%;
          background: radial-gradient(circle, rgba(129, 236, 236, 0.2) 0%, transparent 40%);
          transform: translate(-50%, -50%); transition: opacity 0.6s ease;
          opacity: 0; pointer-events: none;
        }
        .portal-glow.active { opacity: 1; }
        .landing-footer { margin-top: 70px; font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); }
        .landing-footer a { color: rgba(255, 255, 255, 0.7); text-decoration: none; font-weight: 500; transition: color 0.3s ease; }
        .landing-footer a:hover { color: #fff; }
        @media (max-width: 768px) {
          .portal-selection { flex-direction: column; gap: 30px; }
          .hero-section { margin-bottom: 50px; }
        }
      `}</style>
    </div>
  );
}