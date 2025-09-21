import React, { useEffect, useState } from "react";
import { 
  addCustomer, 
  getCustomers, 
  updateStatus, 
  getAllUsers, 
  updateStatusByQR,
  changePassword 
} from "../api";

export default function ServicemanDashboard() {
  const [activeTab, setActiveTab] = useState("active-orders");
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Form states
  const [orderName, setOrderName] = useState("");
  const [clothesCount, setClothesCount] = useState(1);
  const [customerUsername, setCustomerUsername] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [qrScanInput, setQrScanInput] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const filteredCustomers = users
    .filter((u) => u.role === "customer")
    .filter((u) => 
      customerUsername && u.username.toLowerCase().includes(customerUsername.toLowerCase())
    );

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setMessage("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  // Filter orders based on search criteria
  const getFilteredOrders = (orders) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || 
        new Date(order.created_at).toDateString() === new Date(dateFilter).toDateString();
      
      const matchesCustomer = !customerFilter ||
        order.name.toLowerCase().includes(customerFilter.toLowerCase());
      
      return matchesSearch && matchesDate && matchesCustomer;
    });
  };

  const activeOrders = getFilteredOrders(
    customers.filter(c => c.status !== "picked_up")
  );

  const pastOrders = getFilteredOrders(
    customers.filter(c => c.status === "picked_up")
  );

  const handleAddCustomer = async () => {
    if (!orderName || !customerUsername || clothesCount <= 0) {
      setMessage("Please fill all fields and select a customer.");
      return;
    }

    const customerExists = users.find(u => u.username === customerUsername && u.role === "customer");
    if (!customerExists) {
      setMessage("Please select a valid customer from the suggestions.");
      return;
    }

    try {
      setLoading(true);
      await addCustomer({ 
        customer_username: customerUsername,
        clothes_count: clothesCount 
      });
      setMessage(`Order "${orderName}" for ${customerUsername} added successfully!`);
      setOrderName("");
      setCustomerUsername("");
      setClothesCount(1);
      setShowSuggestions(false);
      fetchCustomers();
    } catch (err) {
      setMessage("Failed to add order: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    if (!qrScanInput.trim()) {
      setMessage("Please enter QR code data");
      return;
    }

    try {
      setLoading(true);
      const updatedCustomer = await updateStatusByQR(qrScanInput.trim());
      setMessage(`Order "${updatedCustomer.name}" updated to: ${updatedCustomer.status}`);
      fetchCustomers();
      setQrScanInput("");
    } catch (err) {
      setMessage("Failed to update status via QR scan: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus(id, status);
      fetchCustomers();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

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

  const TabButton = ({ id, label, icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "12px 20px",
        backgroundColor: activeTab === id ? "#007bff" : "transparent",
        color: activeTab === id ? "white" : "#666",
        border: "2px solid",
        borderColor: activeTab === id ? "#007bff" : "#dee2e6",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      <span>{icon}</span>
      {label}
      {count !== undefined && (
        <span style={{
          backgroundColor: activeTab === id ? "rgba(255,255,255,0.2)" : "#007bff",
          color: activeTab === id ? "white" : "white",
          borderRadius: "12px",
          padding: "2px 8px",
          fontSize: "0.8rem",
          fontWeight: "bold"
        }}>
          {count}
        </span>
      )}
    </button>
  );

  const OrdersTable = ({ orders, showAllColumns = true }) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse", 
        backgroundColor: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={tableHeaderStyle}>SL No</th>
            <th style={tableHeaderStyle}>Order Name</th>
            <th style={tableHeaderStyle}>Date</th>
            <th style={tableHeaderStyle}>Clothes Count</th>
            <th style={tableHeaderStyle}>Status</th>
            {showAllColumns && <th style={tableHeaderStyle}>Modify</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tableCellStyle}>{idx + 1}</td>
              <td style={tableCellStyle}>
                <div>
                  <div style={{ fontWeight: "600", color: "#333" }}>{order.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>ID: {order.id.substring(0, 8)}...</div>
                </div>
              </td>
              <td style={tableCellStyle}>
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td style={{ ...tableCellStyle, textAlign: "center", fontWeight: "600" }}>
                {order.clothes_count}
              </td>
              <td style={tableCellStyle}>
                <span style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  backgroundColor: getStatusColor(order.status),
                  color: "white"
                }}>
                  {order.status.replace("_", " ").toUpperCase()}
                </span>
              </td>
              {showAllColumns && (
                <td style={tableCellStyle}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="started">Started</option>
                    <option value="washed">Washed</option>
                    <option value="dried">Dried</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="picked_up">Picked Up</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#666",
          backgroundColor: "white",
          borderRadius: "8px",
          marginTop: "20px"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📋</div>
          No orders found
        </div>
      )}
    </div>
  );

  const tableHeaderStyle = {
    padding: "15px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#333",
    borderBottom: "2px solid #dee2e6"
  };

  const tableCellStyle = {
    padding: "12px",
    verticalAlign: "top"
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

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <TabButton 
          id="active-orders" 
          label="Active Orders" 
          icon="📋" 
          count={activeOrders.length}
        />
        <TabButton 
          id="past-orders" 
          label="Past Orders" 
          icon="📚" 
          count={pastOrders.length}
        />
        <TabButton 
          id="manage-customers" 
          label="Manage Customers" 
          icon="👥"
        />
        <TabButton 
          id="add-order" 
          label="Add Order" 
          icon="➕"
        />
        <TabButton 
          id="qr-scanner" 
          label="QR Scanner" 
          icon="📱"
        />
        <TabButton 
          id="settings" 
          label="Settings" 
          icon="⚙️"
        />
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: "12px 20px",
          marginBottom: "20px",
          borderRadius: "8px",
          backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
          color: message.includes("successfully") ? "#155724" : "#721c24",
          border: "1px solid " + (message.includes("successfully") ? "#c3e6cb" : "#f5c6cb")
        }}>
          {message}
          <button
            onClick={() => setMessage("")}
            style={{
              float: "right",
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
      {activeTab === "active-orders" && (
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px"
          }}>
            <h2 style={{ margin: "0", color: "#333" }}>📋 Active Orders</h2>
            <button
              onClick={fetchCustomers}
              style={{
                padding: "10px 15px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Filters */}
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "25px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>🔍 Filters</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                  Search Orders:
                </label>
                <input
                  type="text"
                  placeholder="Search by order name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                  Filter by Date:
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                  Filter by Customer:
                </label>
                <input
                  type="text"
                  placeholder="Customer name..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
            </div>
            
            {(searchTerm || dateFilter || customerFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  setCustomerFilter("");
                }}
                style={{
                  marginTop: "15px",
                  padding: "8px 15px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <OrdersTable orders={activeOrders} />
        </div>
      )}

      {activeTab === "past-orders" && (
        <div>
          <h2 style={{ marginBottom: "25px", color: "#333" }}>📚 Past Orders (Completed)</h2>
          <OrdersTable orders={pastOrders} showAllColumns={false} />
        </div>
      )}

      {activeTab === "manage-customers" && (
        <div>
          <h2 style={{ marginBottom: "25px", color: "#333" }}>👥 Manage Customers</h2>
          <div style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={tableHeaderStyle}>Username</th>
                    <th style={tableHeaderStyle}>Role</th>
                    <th style={tableHeaderStyle}>Total Orders</th>
                    <th style={tableHeaderStyle}>Active Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === "customer").map(user => {
                    const userOrders = customers.filter(c => c.owner_id === user.id);
                    const activeUserOrders = userOrders.filter(c => c.status !== "picked_up");
                    
                    return (
                      <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: "600", color: "#333" }}>{user.username}</div>
                          <div style={{ fontSize: "0.8rem", color: "#666" }}>ID: {user.id.substring(0, 8)}...</div>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: "4px 10px",
                            backgroundColor: "#28a745",
                            color: "white",
                            borderRadius: "12px",
                            fontSize: "0.8rem"
                          }}>
                            Customer
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: "center", fontWeight: "600" }}>
                          {userOrders.length}
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: "center", fontWeight: "600" }}>
                          {activeUserOrders.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "add-order" && (
        <div>
          <h2 style={{ marginBottom: "25px", color: "#333" }}>➕ Add New Order</h2>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "25px"
            }}>
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Customer Username:
                </label>
                <input
                  placeholder="Type customer username..."
                  value={customerUsername}
                  onChange={(e) => {
                    setCustomerUsername(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(customerUsername.length > 0)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
                
                {showSuggestions && filteredCustomers.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}>
                    {filteredCustomers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setCustomerUsername(user.username);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                      >
                        {user.username}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Order Name:
                </label>
                <input
                  placeholder="Order description..."
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Clothes Count:
                </label>
                <input
                  type="number"
                  min="1"
                  value={clothesCount}
                  onChange={(e) => setClothesCount(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>
            
            <button 
              onClick={handleAddCustomer}
              disabled={loading}
              style={{
                padding: "15px 30px",
                backgroundColor: loading ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "1.1rem"
              }}
            >
              {loading ? "⏳ Adding..." : "➕ Add Order"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "qr-scanner" && (
        <div>
          <h2 style={{ marginBottom: "25px", color: "#333" }}>📱 QR Code Scanner</h2>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", gap: "15px", alignItems: "end", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  QR Code Data:
                </label>
                <input
                  type="text"
                  placeholder="Scan or enter QR code..."
                  value={qrScanInput}
                  onChange={(e) => setQrScanInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.2rem",
                    border: "2px solid #007bff",
                    borderRadius: "8px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              
              <button 
                onClick={handleQRScan}
                disabled={loading || !qrScanInput.trim()}
                style={{
                  padding: "15px 25px",
                  backgroundColor: loading ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading || !qrScanInput.trim() ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  whiteSpace: "nowrap"
                }}
              >
                {loading ? "⏳ Processing..." : "🔄 Update Status"}
              </button>
            </div>
            
            <div style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "#666"
            }}>
              <strong>Instructions:</strong>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px" }}>
                <li><strong>USB Scanner:</strong> Click in the input field above and scan the QR code</li>
                <li><strong>Mobile App:</strong> Use your phone to scan and type/paste the code</li>
                <li><strong>Manual Entry:</strong> Type the Order ID from the physical tag</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div>
          <h2 style={{ marginBottom: "25px", color: "#333" }}>⚙️ Settings</h2>
          
          {/* Change Password Section */}
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "25px"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>🔒 Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "25px"
              }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    New Password:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                style={{
                  padding: "12px 25px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem"
                }}
              >
                🔒 Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}