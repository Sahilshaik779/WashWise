import { useState } from "react";

export default function LandingPage({ onSelectLoginType }) {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: "1100px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "center"
      }}>
        {/* Left Side - Welcome Content */}
        <div style={{
          color: "white",
          textAlign: "left"
        }}>
          <div style={{
            fontSize: "4rem",
            marginBottom: "20px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}>
            🧺
          </div>
          
          <h1 style={{
            fontSize: "3.2rem",
            fontWeight: "700",
            marginBottom: "20px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            lineHeight: "1.1"
          }}>
            Laundry Manager
          </h1>
          
          <div style={{
            fontSize: "1.3rem",
            fontWeight: "300",
            marginBottom: "30px",
            opacity: "0.9",
            lineHeight: "1.5",
            fontStyle: "italic"
          }}>
            "Clean clothes, Clear mind - <br/>
            Where every wash tells a story of care"
          </div>
          
          <div style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            padding: "25px",
            borderRadius: "15px",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <h3 style={{
              margin: "0 0 15px 0",
              fontSize: "1.4rem",
              fontWeight: "600"
            }}>
              ✨ Experience Premium Care
            </h3>
            <ul style={{
              listStyle: "none",
              padding: "0",
              margin: "0",
              fontSize: "1rem",
              lineHeight: "1.8"
            }}>
              <li>🚀 Real-time order tracking</li>
              <li>📱 QR code convenience</li>
              <li>🔒 Secure & reliable service</li>
              <li>⭐ Professional quality guaranteed</li>
            </ul>
          </div>
        </div>

        {/* Right Side - Login Options */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "50px 40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.3)"
        }}>
          <h2 style={{
            color: "#333",
            fontSize: "2rem",
            fontWeight: "600",
            marginBottom: "15px"
          }}>
            Welcome Back!
          </h2>
          
          <p style={{
            color: "#666",
            fontSize: "1.1rem",
            marginBottom: "40px",
            lineHeight: "1.5"
          }}>
            Choose your portal to access your personalized laundry experience
          </p>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "25px"
          }}>
            {/* Customer Login Button */}
            <button
              onClick={() => onSelectLoginType("customer")}
              onMouseEnter={() => setHoveredButton("customer")}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                padding: "20px 30px",
                fontSize: "1.2rem",
                fontWeight: "600",
                background: hoveredButton === "customer" 
                  ? "linear-gradient(45deg, #28a745, #20c997)" 
                  : "linear-gradient(45deg, #20c997, #28a745)",
                color: "white",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: hoveredButton === "customer" ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hoveredButton === "customer" 
                  ? "0 15px 35px rgba(40, 167, 69, 0.4)" 
                  : "0 10px 25px rgba(40, 167, 69, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px"
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>👤</span>
              Customer Portal
            </button>

            {/* Admin Login Button */}
            <button
              onClick={() => onSelectLoginType("serviceman")}
              onMouseEnter={() => setHoveredButton("admin")}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                padding: "20px 30px",
                fontSize: "1.2rem",
                fontWeight: "600",
                background: hoveredButton === "admin" 
                  ? "linear-gradient(45deg, #007bff, #6f42c1)" 
                  : "linear-gradient(45deg, #6f42c1, #007bff)",
                color: "white",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: hoveredButton === "admin" ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hoveredButton === "admin" 
                  ? "0 15px 35px rgba(111, 66, 193, 0.4)" 
                  : "0 10px 25px rgba(111, 66, 193, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px"
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>🔧</span>
              Admin Portal
            </button>
          </div>

          <div style={{
            marginTop: "35px",
            paddingTop: "25px",
            borderTop: "1px solid #eee",
            color: "#999",
            fontSize: "0.9rem"
          }}>
            Need help? Contact support: <br/>
            <strong style={{ color: "#007bff" }}>support@laundrymanager.com</strong>
          </div>
        </div>
      </div>
    </div>
  );
}