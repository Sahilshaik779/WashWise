import React, { useEffect, useState } from "react";
import { addCustomer, getCustomers, updateStatus, getAllUsers, updateStatusByQR } from "../api";

export default function ServicemanDashboard() {
  const [customers, setCustomers] = useState([]);
  const [orderName, setOrderName] = useState("");
  const [clothesCount, setClothesCount] = useState(1);
  const [customerUsername, setCustomerUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [qrScanInput, setQrScanInput] = useState("");

  // ✅ ADDED: Filter customers based on input
  const filteredCustomers = users
    .filter((u) => u.role === "customer")
    .filter((u) => 
      customerUsername && u.username.toLowerCase().includes(customerUsername.toLowerCase())
    );

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
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

  const handleAddCustomer = async () => {
    if (!orderName || !customerUsername || clothesCount <= 0) {
      setMessage("Please fill all fields and select a customer.");
      return;
    }

    // ✅ FIXED: Check if customer exists
    const customerExists = users.find(u => u.username === customerUsername && u.role === "customer");
    if (!customerExists) {
      setMessage("Please select a valid customer from the suggestions.");
      return;
    }

    try {
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
      console.error(err);
    }
  };

  // ✅ ADDED: QR Code scanning functionality
  const handleQRScan = async () => {
    if (!qrScanInput.trim()) {
      setMessage("Please enter QR code data");
      return;
    }

    try {
      // Use the new QR-based API endpoint
      const updatedCustomer = await updateStatusByQR(qrScanInput.trim());
      setMessage(`Order "${updatedCustomer.name}" updated to: ${updatedCustomer.status}`);
      fetchCustomers();
      setQrScanInput("");
    } catch (err) {
      setMessage("Failed to update status via QR scan: " + (err.response?.data?.detail || err.message));
      console.error(err);
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

  const handleCustomerSelect = (username) => {
    setCustomerUsername(username);
    setShowSuggestions(false);
  };

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>🔧 Serviceman Dashboard</h2>
      
      {/* ✅ ADDED: QR Scanner Section */}
      <div style={{ 
        marginBottom: "30px", 
        border: "2px solid #007bff", 
        padding: "15px", 
        borderRadius: "8px",
        backgroundColor: "#f8f9fa"
      }}>
        <h3>📱 QR Code Scanner</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            placeholder="Scan or enter QR code data"
            value={qrScanInput}
            onChange={(e) => setQrScanInput(e.target.value)}
            style={{ flex: 1, padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ddd" }}
            onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
          />
          <button 
            onClick={handleQRScan}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Update Status
          </button>
        </div>
        <small style={{ color: "#666" }}>Scan QR code to automatically advance order to next stage</small>
      </div>

      {/* Add New Order Section */}
      <div style={{ 
        marginBottom: "30px", 
        border: "1px solid #28a745", 
        padding: "15px", 
        borderRadius: "8px",
        backgroundColor: "#f8fff9"
      }}>
        <h3>➕ Add New Order</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px", alignItems: "end" }}>
          {/* ✅ FIXED: Autocomplete customer input */}
          <div style={{ position: "relative" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Customer:</label>
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
                padding: "10px", 
                borderRadius: "4px", 
                border: "1px solid #ddd",
                fontSize: "14px"
              }}
            />
            
            {/* ✅ ADDED: Suggestions dropdown */}
            {showSuggestions && filteredCustomers.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderTop: "none",
                borderRadius: "0 0 4px 4px",
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 1000
              }}>
                {filteredCustomers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleCustomerSelect(user.username)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      backgroundColor: "white"
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
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Order Name:</label>
            <input
              placeholder="Order description..."
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Clothes Count:</label>
            <input
              type="number"
              min="1"
              value={clothesCount}
              onChange={(e) => setClothesCount(Number(e.target.value))}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          
          <button 
            onClick={handleAddCustomer}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer",
              fontWeight: "bold",
              height: "fit-content"
            }}
          >
            Add Order
          </button>
        </div>
      </div>

      {message && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "20px",
          borderRadius: "4px",
          backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
          color: message.includes("successfully") ? "#155724" : "#721c24",
          border: message.includes("successfully") ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
        }}>
          {message}
        </div>
      )}
      
      {/* ✅ FIXED: Simplified orders table */}
      <h3>📋 All Orders</h3>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th>SL No</th>
            <th>Order Name</th>
            <th>Date</th>
            <th>Clothes Count</th>
            <th>Status</th>
            <th>Modify</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, idx) => (
            <tr key={c.id}>
              <td style={{ textAlign: "center" }}>{idx + 1}</td>
              <td>{c.name}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
              <td style={{ textAlign: "center" }}>{c.clothes_count}</td>
              <td>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor: 
                    c.status === "pending" ? "#ffc107" :
                    c.status === "started" ? "#17a2b8" :
                    c.status === "washed" ? "#6f42c1" :
                    c.status === "dried" ? "#fd7e14" :
                    c.status === "ready_for_pickup" ? "#28a745" : "#6c757d",
                  color: "white"
                }}>
                  {c.status.replace("_", " ").toUpperCase()}
                </span>
              </td>
              <td>
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  style={{ padding: "5px", borderRadius: "4px" }}
                >
                  <option value="pending">Pending</option>
                  <option value="started">Started</option>
                  <option value="washed">Washed</option>
                  <option value="dried">Dried</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="picked_up">Picked Up</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {customers.length === 0 && (
        <p style={{ textAlign: "center", color: "#666", fontStyle: "italic", padding: "20px" }}>
          No orders yet. Add your first order above!
        </p>
      )}
    </div>
  );
}