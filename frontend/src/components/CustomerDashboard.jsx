import { useEffect, useState } from "react";
import { getMyOrders } from "../api";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      console.log("Orders data:", data); // ✅ Debug log
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
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        maxWidth: "800px", 
        margin: "0 auto" 
      }}>
        <div style={{ fontSize: "18px", color: "#666" }}>Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        maxWidth: "800px", 
        margin: "0 auto" 
      }}>
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          borderRadius: "8px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
        <button 
          onClick={fetchOrders}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div style={{ 
        padding: "40px", 
        textAlign: "center", 
        maxWidth: "800px", 
        margin: "0 auto" 
      }}>
        <div style={{ 
          padding: "40px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "12px",
          border: "2px dashed #dee2e6"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧺</div>
          <h3 style={{ color: "#666", marginBottom: "8px" }}>No orders yet!</h3>
          <p style={{ color: "#999", margin: "0" }}>
            Visit your local laundry service to place your first order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1000px", 
      margin: "0 auto" 
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px" 
      }}>
        <h2 style={{ margin: "0", color: "#333" }}>🛍️ My Laundry Orders</h2>
        <button 
          onClick={fetchOrders}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ 
        display: "grid", 
        gap: "20px",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))"
      }}>
        {orders.map((order) => (
          <div 
            key={order.id} 
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "flex-start",
              marginBottom: "15px"
            }}>
              <h3 style={{ 
                margin: "0", 
                color: "#333",
                fontSize: "18px",
                fontWeight: "600"
              }}>
                {order.name}
              </h3>
              <span style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: getStatusColor(order.status),
                color: "white",
                whiteSpace: "nowrap"
              }}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: "8px",
                color: "#666"
              }}>
                <span>📅 Date:</span>
                <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: "8px",
                color: "#666"
              }}>
                <span>👕 Items:</span>
                <strong>{order.clothes_count} pieces</strong>
              </div>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: "8px",
                color: "#666"
              }}>
                <span>🆔 Order ID:</span>
                <code style={{ fontSize: "12px", backgroundColor: "#f8f9fa", padding: "2px 6px", borderRadius: "3px" }}>
                  {order.id}
                </code>
              </div>
            </div>

            {/* ✅ FIXED: QR Code display with better error handling */}
            <div style={{ 
              textAlign: "center", 
              paddingTop: "15px", 
              borderTop: "1px solid #eee" 
            }}>
              <div style={{ 
                fontSize: "14px", 
                color: "#666", 
                marginBottom: "10px",
                fontWeight: "600"
              }}>
                📱 Your QR Code:
              </div>
              
              {order.qr_code_url ? (
                <div>
                  <img
                    src={`http://127.0.0.1:8000${order.qr_code_url}`}
                    alt="Order QR Code"
                    style={{ 
                      width: "100px", 
                      height: "100px", 
                      border: "2px solid #007bff",
                      borderRadius: "8px",
                      padding: "5px",
                      backgroundColor: "white"
                    }}
                    onError={(e) => {
                      console.error("QR Image failed to load:", `http://127.0.0.1:8000${order.qr_code_url}`);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ 
                    display: "none", 
                    padding: "20px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "4px",
                    fontSize: "12px"
                  }}>
                    QR Code not available
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: "20px",
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}>
                  QR Code generating...
                </div>
              )}
              
              <div style={{ 
                fontSize: "11px", 
                color: "#999", 
                marginTop: "8px" 
              }}>
                Show this to laundry staff
              </div>
            </div>

            {/* Progress indicator */}
            <div style={{ marginTop: "15px" }}>
              <div style={{ 
                fontSize: "12px", 
                color: "#666", 
                marginBottom: "8px" 
              }}>
                Progress:
              </div>
              <div style={{ 
                width: "100%", 
                height: "8px", 
                backgroundColor: "#e9ecef", 
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  backgroundColor: getStatusColor(order.status),
                  width: 
                    order.status === "pending" ? "16%" :
                    order.status === "started" ? "33%" :
                    order.status === "washed" ? "50%" :
                    order.status === "dried" ? "66%" :
                    order.status === "ready_for_pickup" ? "83%" : "100%",
                  transition: "width 0.3s ease"
                }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        textAlign: "center", 
        marginTop: "30px", 
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#666"
      }}>
        🔄 Orders refresh automatically every 30 seconds
      </div>
    </div>
  );
}