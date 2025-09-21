import { useEffect, useState } from "react";
import { getMyOrders, changePassword } from "../api";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("my-orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("Failed to change password: " + (err.response?.data?.detail || "Invalid current password"));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      started: "#17a2b8", 
      washed: "#6f42c1",
      dried: "#fd7e14",
      ready_for_pickup: "#28a745",
      picked_up: "#6c757d"
    };
    return colors[status] || "#6c757d";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "📋 Pending",
      started: "🔄 In Progress",
      washed: "🧼 Washed",
      dried: "🌬️ Dried", 
      ready_for_pickup: "✅ Ready for Pickup",
      picked_up: "✨ Completed"
    };
    return texts[status] || status;
  };

  const getProgressPercentage = (status) => {
    const progress = {
      pending: 16,
      started: 33,
      washed: 50,
      dried: 66,
      ready_for_pickup: 83,
      picked_up: 100
    };
    return progress[status] || 0;
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "15px 25px",
        backgroundColor: activeTab === id ? "#28a745" : "white",
        color: activeTab === id ? "white" : "#666",
        border: "2px solid",
        borderColor: activeTab === id ? "#28a745" : "#dee2e6",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "600",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: activeTab === id ? "0 4px 12px rgba(40, 167, 69, 0.3)" : "0 2px 4px rgba(0,0,0,0.1)"
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      {label}
    </button>
  );

  const activeOrders = orders.filter(order => order.status !== "picked_up");
  const completedOrders = orders.filter(order => order.status === "picked_up");

  if (loading && orders.length === 0) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        fontSize: "1.2rem",
        color: "#666"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⏳</div>
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <TabButton 
          id="my-orders" 
          label={`My Orders (${activeOrders.length})`}
          icon="🛍️"
        />
        <TabButton 
          id="order-history" 
          label={`Order History (${completedOrders.length})`}
          icon="📚"
        />
        <TabButton 
          id="settings" 
          label="Settings"
          icon="⚙️"
        />
      </div>

      {/* Message Display */}
      {(message || error) && (
        <div style={{
          padding: "15px 20px",
          marginBottom: "25px",
          borderRadius: "10px",
          backgroundColor: error ? "#f8d7da" : (message.includes("successfully") ? "#d4edda" : "#fff3cd"),
          color: error ? "#721c24" : (message.includes("successfully") ? "#155724" : "#856404"),
          border: "1px solid " + (error ? "#f5c6cb" : (message.includes("successfully") ? "#c3e6cb" : "#ffeaa7")),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>{error || message}</span>
          <button
            onClick={() => {
              setMessage("");
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "inherit"
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "my-orders" && (
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px"
          }}>
            <h2 style={{ margin: "0", color: "#333" }}>🛍️ My Active Orders</h2>
            <button 
              onClick={fetchOrders}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600"
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "white",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🧺</div>
              <h3 style={{ color: "#666", marginBottom: "10px" }}>No active orders</h3>
              <p style={{ color: "#999", margin: "0", fontSize: "1.1rem" }}>
                Visit your local laundry service to place a new order.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gap: "25px",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))"
            }}>
              {activeOrders.map((order) => (
                <div 
                  key={order.id} 
                  style={{
                    backgroundColor: "white",
                    borderRadius: "15px",
                    padding: "25px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "20px"
                  }}>
                    <div>
                      <h3 style={{ 
                        margin: "0", 
                        color: "#333",
                        fontSize: "1.3rem",
                        fontWeight: "700"
                      }}>
                        {order.name}
                      </h3>
                      <div style={{ 
                        fontSize: "0.85rem", 
                        color: "#666", 
                        marginTop: "5px",
                        fontFamily: "monospace"
                      }}>
                        ID: {order.id.substring(0, 12)}...
                      </div>
                    </div>
                    <span style={{
                      padding: "8px 16px",
                      borderRadius: "25px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      backgroundColor: getStatusColor(order.status),
                      color: "white",
                      whiteSpace: "nowrap"
                    }}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ 
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "15px",
                      marginBottom: "15px"
                    }}>
                      <div style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "5px" }}>
                          📅 Date
                        </div>
                        <div style={{ fontWeight: "600", color: "#333" }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "5px" }}>
                          👕 Items
                        </div>
                        <div style={{ fontWeight: "600", color: "#333" }}>
                          {order.clothes_count} pieces
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ 
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px"
                      }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#333" }}>
                          Progress:
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#666" }}>
                          {getProgressPercentage(order.status)}%
                        </span>
                      </div>
                      <div style={{ 
                        width: "100%", 
                        height: "10px", 
                        backgroundColor: "#e9ecef", 
                        borderRadius: "5px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          height: "100%",
                          backgroundColor: getStatusColor(order.status),
                          width: `${getProgressPercentage(order.status)}%`,
                          transition: "width 0.5s ease",
                          borderRadius: "5px"
                        }}></div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {order.qr_code_url && (
                    <div style={{ 
                      textAlign: "center", 
                      paddingTop: "20px", 
                      borderTop: "1px solid #eee" 
                    }}>
                      <div style={{ 
                        fontSize: "0.9rem", 
                        color: "#666", 
                        marginBottom: "12px",
                        fontWeight: "600"
                      }}>
                        📱 Your QR Code:
                      </div>
                      
                      <div style={{
                        display: "inline-block",
                        padding: "10px",
                        backgroundColor: "white",
                        borderRadius: "12px",
                        border: "3px solid " + getStatusColor(order.status),
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                      }}>
                        <img
                          src={`http://127.0.0.1:8000${order.qr_code_url}`}
                          alt="Order QR Code"
                          style={{ 
                            width: "100px", 
                            height: "100px",
                            borderRadius: "8px"
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ 
                          display: "none", 
                          width: "100px",
                          height: "100px",
                          backgroundColor: "#f8d7da",
                          color: "#721c24",
                          borderRadius: "8px",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem"
                        }}>
                          QR Not Available
                        </div>
                      </div>
                      
                      <div style={{ 
                        fontSize: "0.8rem", 
                        color: "#999", 
                        marginTop: "8px",
                        fontStyle: "italic"
                      }}>
                        Show this to laundry staff
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "order-history" && (
        <div>
          <h2 style={{ marginBottom: "25px", color: "#333" }}>📚 Order History</h2>
          
          {completedOrders.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "white",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📋</div>
              <h3 style={{ color: "#666", marginBottom: "10px" }}>No completed orders yet</h3>
              <p style={{ color: "#999", margin: "0", fontSize: "1.1rem" }}>
                Your completed orders will appear here.
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: "white",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  fontSize: "0.95rem"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th style={{
                        padding: "15px 12px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#333",
                        borderBottom: "2px solid #dee2e6"
                      }}>
                        Order Name
                      </th>
                      <th style={{
                        padding: "15px 12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#333",
                        borderBottom: "2px solid #dee2e6"
                      }}>
                        Date
                      </th>
                      <th style={{
                        padding: "15px 12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#333",
                        borderBottom: "2px solid #dee2e6"
                      }}>
                        Items
                      </th>
                      <th style={{
                        padding: "15px 12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#333",
                        borderBottom: "2px solid #dee2e6"
                      }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px", verticalAlign: "top" }}>
                          <div>
                            <div style={{ fontWeight: "600", color: "#333", marginBottom: "5px" }}>
                              {order.name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#666", fontFamily: "monospace" }}>
                              {order.id.substring(0, 12)}...
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>
                          {order.clothes_count}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            backgroundColor: getStatusColor(order.status),
                            color: "white"
                          }}>
                            ✨ COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div>
          <h2 style={{ marginBottom: "25px", color: "#333" }}>⚙️ Settings</h2>
          
          {/* Change Password Section */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              marginBottom: "25px", 
              color: "#333",
              fontSize: "1.3rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              🔒 Change Password
            </h3>
            
            <form onSubmit={handleChangePassword}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "30px"
              }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: "#333" 
                  }}>
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    style={{
                      width: "100%",
                      padding: "15px",
                      border: "2px solid #e9ecef",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#28a745"}
                    onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: "#333" 
                  }}>
                    New Password:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    style={{
                      width: "100%",
                      padding: "15px",
                      border: "2px solid #e9ecef",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#28a745"}
                    onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: "#333" 
                  }}>
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    style={{
                      width: "100%",
                      padding: "15px",
                      border: "2px solid #e9ecef",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#28a745"}
                    onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                style={{
                  padding: "15px 30px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#218838";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#28a745";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🔒 Update Password
              </button>
            </form>
            
            <div style={{
              marginTop: "25px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              fontSize: "0.9rem",
              color: "#666"
            }}>
              <strong>Password Requirements:</strong>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px" }}>
                <li>At least 6 characters long</li>
                <li>Use a strong, unique password</li>
                <li>Don't share your password with others</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {activeTab === "my-orders" && (
        <div style={{ 
          textAlign: "center", 
          marginTop: "30px", 
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "10px",
          fontSize: "0.9rem",
          color: "#666",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          🔄 Orders refresh automatically every 30 seconds
        </div>
      )}
    </div>
  );
}