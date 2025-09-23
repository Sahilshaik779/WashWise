import React, { useEffect, useState } from "react";
import {
  addCustomer,
  getCustomers,
  updateStatus,
  getAllUsers,
  getOrderByID, // IMPORTANT: Import a new function to get order by ID
  changePassword
} from "../api";

// --- SVG Icons ---
const WashWiseLogo = ({ small }) => ( <svg width={small ? "40" : "80"} height={small ? "40" : "80"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logo-gradient)" strokeWidth="1.5"/><path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 10.1642 8.21203 8.6132 9.875 7.82883" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/><defs><linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#81ECEC"/><stop offset="1" stopColor="#74B9FF"/></linearGradient></defs></svg>);
const IconClipboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const IconHistory = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconAdd = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconQR = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><path d="M3 14h7v7H3z"></path></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default function ServicemanDashboard() {
  // --- STATES ---
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("active-orders");
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderName, setOrderName] = useState("");
  const [clothesCount, setClothesCount] = useState(1);
  const [customerUsername, setCustomerUsername] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [qrScanInput, setQrScanInput] = useState("");
  const [scannedOrder, setScannedOrder] = useState(null); // NEW: To hold the fetched order
  const [newStatus, setNewStatus] = useState(""); // NEW: To hold the selected new status
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- LOGIC ---
  const filteredCustomers = users.filter((u) => u.role === "customer" && customerUsername && u.username.toLowerCase().includes(customerUsername.toLowerCase()));
  const fetchCustomers = async () => { try { setLoading(true); const data = await getCustomers(); setCustomers(data); } catch (err) { console.error("Error fetching customers:", err); setMessage("Failed to load orders"); } finally { setLoading(false); } };
  const fetchUsers = async () => { try { const data = await getAllUsers(); setUsers(data); } catch (err) { console.error("Error fetching users:", err); } };
  useEffect(() => { fetchCustomers(); fetchUsers(); }, []);
  const getFilteredOrders = (orders) => orders.filter(order => (!searchTerm || order.name.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.toLowerCase().includes(searchTerm.toLowerCase())) && (!dateFilter || new Date(order.created_at).toDateString() === new Date(dateFilter).toDateString()) && (!customerFilter || order.name.toLowerCase().includes(customerFilter.toLowerCase())));
  const activeOrders = getFilteredOrders(customers.filter(c => c.status !== "picked_up"));
  const pastOrders = getFilteredOrders(customers.filter(c => c.status === "picked_up"));
  const handleAddCustomer = async () => { if (!orderName || !customerUsername || clothesCount <= 0) return setMessage("Please fill all fields and select a customer."); if (!users.find(u => u.username === customerUsername && u.role === "customer")) return setMessage("Please select a valid customer from the suggestions."); try { setLoading(true); await addCustomer({ customer_username: customerUsername, clothes_count: clothesCount }); setMessage(`Order for ${customerUsername} added successfully!`); setOrderName(""); setCustomerUsername(""); setClothesCount(1); setShowSuggestions(false); fetchCustomers(); } catch (err) { setMessage("Failed to add order: " + (err.response?.data?.detail || err.message)); } finally { setLoading(false); } };
  
  const handleFetchOrder = async () => {
    if (!qrScanInput.trim()) return setMessage("Please enter QR code data");
    setLoading(true); setMessage(""); setScannedOrder(null);
    try {
      const orderData = await getOrderByID(qrScanInput.trim());
      setScannedOrder(orderData);
      setNewStatus(orderData.status); 
      setQrScanInput("");
    } catch (err) {
      // **ERROR HANDLING FIX**
      if (err.message.includes("JSON")) {
        setMessage("API Error: The server is not responding correctly. Please check the API endpoint.");
      } else {
        setMessage("Failed to find order. Please check the ID and try again.");
      }
    } finally { setLoading(false); }
  };

  const handleConfirmUpdate = async () => {
    if (!scannedOrder || !newStatus) return;
    setLoading(true); setMessage("");
    try {
      await updateStatus(scannedOrder.id, newStatus);
      setMessage(`Order "${scannedOrder.name}" successfully updated to ${newStatus.replace("_", " ")}!`);
      setScannedOrder(null);
      setNewStatus("");
      fetchCustomers();
    } catch (err) {
      setMessage("Failed to update status: " + (err.response?.data?.detail || err.message));
    } finally { setLoading(false); }
  };
  
  const handleStatusChange = async (id, status) => { try { await updateStatus(id, status); fetchCustomers(); } catch (err) { console.error("Failed to update status:", err); } };
  const handleChangePassword = async (e) => { e.preventDefault(); if (newPassword !== confirmPassword) return setMessage("New passwords don't match"); if (newPassword.length < 6) return setMessage("Password must be at least 6 characters"); try { await changePassword(currentPassword, newPassword); setMessage("Password changed successfully!"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } catch (err) { setMessage("Failed to change password: " + (err.response?.data?.detail || "Invalid current password")); } };
  const handleLogout = () => { localStorage.clear(); window.location.href = '/'; };

  // --- UI Components ---
  const getStatusColor = (status) => ({ pending: "#ffc107", started: "#17a2b8", washed: "#6f42c1", dried: "#fd7e14", ready_for_pickup: "#28a745", picked_up: "#6c757d" })[status] || "#6c757d";
  
  const TABS = [
    { id: "active-orders", label: "Active Orders", icon: <IconClipboard />, count: activeOrders.length },
    { id: "past-orders", label: "Past Orders", icon: <IconHistory /> },
    { id: "manage-customers", label: "Manage Customers", icon: <IconUsers /> },
    { id: "add-order", label: "Add Order", icon: <IconAdd /> },
    { id: "qr-scanner", label: "QR Scanner", icon: <IconQR /> },
    { id: "settings", label: "Settings", icon: <IconSettings /> },
  ];
  
  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="app-container">
      <header className="top-bar">
        <div className="logo-section">
          <WashWiseLogo small />
          <span className="brand-name">WashWise</span>
        </div>
        <div className="user-section">
          <span className="user-role">Admin</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className={`dashboard-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar">
          <div className="sidebar-header">
            <label className="toggle-switch">
              <input type="checkbox" checked={!isSidebarCollapsed} onChange={() => setSidebarCollapsed(!isSidebarCollapsed)} />
              <span className="slider round"></span>
            </label>
          </div>
          <ul className="sidebar-nav">
            {TABS.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? "active" : ""}
                >
                  <span className="nav-icon-wrapper"><span className="nav-icon">{tab.icon}</span></span>
                  <span className="nav-label">{tab.label}</span>
                  {tab.id === 'active-orders' && tab.count !== undefined && <span className="nav-count">{tab.count}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="content-area">
          <h2 className="content-title">{currentTab.label}</h2>
          {message && (<div className={`message ${message.includes("successfully") ? 'success' : 'error'}`}>{message}<button onClick={() => setMessage("")}>×</button></div>)}
          
          {activeTab === "active-orders" && ( <div className="tab-content"><div className="card"><h3 className="card-title">Filters</h3><div className="grid three-cols"><div><label>Search Orders:</label><input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div><label>Filter by Date:</label><input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} /></div><div><label>Filter by Customer:</label><input type="text" placeholder="Customer name..." value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} /></div></div>{(searchTerm || dateFilter || customerFilter) && <button className="btn-secondary" onClick={() => { setSearchTerm(""); setDateFilter(""); setCustomerFilter(""); }}>Clear Filters</button>}</div><div className="card"><div className="table-container"><table className="data-table"><thead><tr><th>SL No</th><th>Order Name</th><th>Date</th><th>Count</th><th>Status</th><th>Modify</th></tr></thead><tbody>{activeOrders.map((order, idx) => (<tr key={order.id}><td>{idx + 1}</td><td><div className="order-name">{order.name}</div><div className="order-id">ID: {order.id.substring(0, 8)}...</div></td><td>{new Date(order.created_at).toLocaleDateString()}</td><td className="text-center">{order.clothes_count}</td><td><span className="status-badge" style={{backgroundColor: getStatusColor(order.status)}}>{order.status.replace("_", " ").toUpperCase()}</span></td><td><select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}><option value="pending">Pending</option><option value="started">Started</option><option value="washed">Washed</option><option value="dried">Dried</option><option value="ready_for_pickup">Ready for Pickup</option><option value="picked_up">Picked Up</option></select></td></tr>))}</tbody></table>{activeOrders.length === 0 && <div className="no-data">No active orders found</div>}</div></div></div>)}
          {activeTab === "past-orders" && ( <div className="tab-content"><div className="card"><div className="table-container"><table className="data-table"><thead><tr><th>SL No</th><th>Order Name</th><th>Date</th><th>Count</th><th>Status</th></tr></thead><tbody>{pastOrders.map((order, idx) => (<tr key={order.id}><td>{idx + 1}</td><td><div className="order-name">{order.name}</div><div className="order-id">ID: {order.id.substring(0, 8)}...</div></td><td>{new Date(order.created_at).toLocaleDateString()}</td><td className="text-center">{order.clothes_count}</td><td><span className="status-badge" style={{backgroundColor: getStatusColor(order.status)}}>{order.status.replace("_", " ").toUpperCase()}</span></td></tr>))}</tbody></table>{pastOrders.length === 0 && <div className="no-data">No past orders found</div>}</div></div></div>)}
          {activeTab === "manage-customers" && ( <div className="tab-content"><div className="card"><div className="table-container"><table className="data-table"><thead><tr><th>Username</th><th>Role</th><th>Total Orders</th><th>Active Orders</th></tr></thead><tbody>{users.filter(u => u.role === "customer").map(user => { const userOrders = customers.filter(c => c.owner_id === user.id); const activeUserOrders = userOrders.filter(c => c.status !== "picked_up"); return (<tr key={user.id}><td><div className="order-name">{user.username}</div><div className="order-id">ID: {user.id.substring(0, 8)}...</div></td><td><span className="status-badge" style={{backgroundColor: "#28a745"}}>Customer</span></td><td className="text-center">{userOrders.length}</td><td className="text-center">{activeUserOrders.length}</td></tr>);})}</tbody></table></div></div></div>)}
          {activeTab === "add-order" && ( <div className="tab-content"><div className="card"><div className="grid three-cols" style={{position: 'relative'}}><div className="autocomplete-container"><label>Customer Username:</label><input placeholder="Type customer username..." value={customerUsername} onChange={(e) => { setCustomerUsername(e.target.value); setShowSuggestions(e.target.value.length > 0); }} onFocus={() => setShowSuggestions(customerUsername.length > 0)}/>{showSuggestions && filteredCustomers.length > 0 && (<div className="suggestions-box">{filteredCustomers.map((user) => (<div key={user.id} onClick={() => { setCustomerUsername(user.username); setShowSuggestions(false); }} className="suggestion-item">{user.username}</div>))}</div>)}</div><div><label>Order Name:</label><input placeholder="Order description..." value={orderName} onChange={(e) => setOrderName(e.target.value)} /></div><div><label>Clothes Count:</label><input type="number" min="1" value={clothesCount} onChange={(e) => setClothesCount(Number(e.target.value))} /></div></div><button onClick={handleAddCustomer} disabled={loading} className="btn-primary">{loading ? "Adding..." : "Add Order"}</button></div></div>)}
          {activeTab === "settings" && ( <div className="tab-content"><div className="card"><h3 className="card-title">Change Password</h3><form onSubmit={handleChangePassword}><div className="grid three-cols"><div><label>Current Password:</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div><div><label>New Password:</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div><div><label>Confirm New Password:</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div></div><button type="submit" className="btn-primary">Update Password</button></form></div></div>)}
          
          {/* --- NEW QR SCANNER UI --- */}
          {activeTab === "qr-scanner" && (
            <div className="tab-content">
              <div className="card">
                {!scannedOrder ? (
                  <>
                    <h3 className="card-title">Scan QR Code</h3>
                    <div className="qr-input-container">
                      <div style={{flex: 1}}>
                        <label>QR Code Data:</label>
                        <input type="text" placeholder="Scan or enter Order ID..." value={qrScanInput} onChange={(e) => setQrScanInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleFetchOrder()} autoFocus />
                      </div>
                      <button onClick={handleFetchOrder} disabled={loading || !qrScanInput.trim()} className="btn-primary">{loading ? "Finding..." : "Find Order"}</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="card-title">Update Order Status</h3>
                    <div className="scanned-order-details">
                      <div><strong>Order Name:</strong> {scannedOrder.name}</div>
                      <div><strong>Order ID:</strong> {scannedOrder.id}</div>
                      <div><strong>Current Status:</strong> <span className="status-badge" style={{backgroundColor: getStatusColor(scannedOrder.status)}}>{scannedOrder.status.replace("_", " ").toUpperCase()}</span></div>
                    </div>
                    <div className="update-controls">
                        <div style={{flex: 1}}>
                            <label>Set New Status:</label>
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="started">Started</option>
                                <option value="washed">Washed</option>
                                <option value="dried">Dried</option>
                                <option value="ready_for_pickup">Ready for Pickup</option>
                                <option value="picked_up">Picked Up</option>
                            </select>
                        </div>
                        <button onClick={handleConfirmUpdate} disabled={loading} className="btn-primary">Confirm Update</button>
                        <button onClick={() => setScannedOrder(null)} className="btn-secondary">Scan Another</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        body { margin: 0; font-family: 'Inter', sans-serif; background-color: #f4f7f9; }
        * { box-sizing: border-box; }
      `}</style>
      <style jsx>{`
        .app-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
        .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 65px; background-color: #cfd9e3; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid #b8c5d3; z-index: 1000; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #242c3d; }
        .user-section { display: flex; align-items: center; gap: 15px; }
        .user-role { font-weight: 600; color: #343a40; background-color: rgba(0,0,0,0.05); padding: 6px 12px; border-radius: 6px; }
        .btn-logout { padding: 8px 15px; background-color: transparent; color: #dc3545; border: 1px solid #dc3545; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-logout:hover { background-color: #dc3545; color: #fff; }
        
        .dashboard-layout { display: flex; height: 100%; padding-top: 65px; }
        .sidebar { width: 260px; background-color: #242c3d; color: #fff; padding: 10px; transition: width 0.3s ease-in-out; overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column; }
        .content-area { flex-grow: 1; padding: 30px; overflow-y: auto; }
        .dashboard-layout.collapsed .sidebar { width: 70px; }
        
        .sidebar-header { 
            display: flex; 
            justify-content: flex-end; /* Aligns toggle to the right */
            padding: 5px;
            height: 44px; /* Give it a fixed height */
            margin-bottom: 15px;
            align-items: center; /* Vertically center the toggle */
        }
        .dashboard-layout.collapsed .sidebar-header {
            justify-content: center; /* Center the toggle when collapsed */
        }

        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #556b8d; transition: .4s; border-radius: 28px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #74b9ff; }
        input:checked + .slider:before { transform: translateX(22px); }
        
        .sidebar-nav { list-style: none; padding: 0; margin: 0; }
        .sidebar-nav button { display: flex; align-items: center; gap: 15px; width: 100%; padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; background: transparent; border: none; color: rgba(255, 255, 255, 0.7); font-size: 1rem; font-weight: 500; cursor: pointer; text-align: left; transition: background-color 0.2s ease, color 0.2s ease; white-space: nowrap; }
        .sidebar-nav button:hover { background-color: rgba(255, 255, 255, 0.1); color: #fff; }
        
        .nav-icon-wrapper { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; transition: background-color 0.2s ease; }
        .nav-icon { min-width: 24px; height: 24px; }
        .sidebar-nav button.active { color: #fff; font-weight: 600; }
        .sidebar-nav button.active .nav-icon-wrapper { background-color: #007bff; }
        
        .dashboard-layout.collapsed .sidebar-nav button { display: grid; place-items: center; width: 100%; height: 50px; padding: 0; margin-bottom: 10px; }
        .dashboard-layout.collapsed .nav-label, .dashboard-layout.collapsed .nav-count { display: none; }
        .dashboard-layout.collapsed .sidebar-nav button.active .nav-icon-wrapper { background-color: #74b9ff; }
        .dashboard-layout.collapsed .sidebar-nav button.active .nav-icon { color: #242c3d; }
        
        .nav-count { margin-left: auto; background-color: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 2px 8px; font-size: 0.8rem; }
        button.active .nav-count { background-color: rgba(255, 255, 255, 0.2); }
        
        .content-title { margin: 0 0 30px 0; font-size: 2rem; color: #242c3d; }
        .tab-content { display: flex; flex-direction: column; gap: 25px; }
        .card { background-color: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .card-title { margin: 0 0 20px 0; font-size: 1.25rem; color: #242c3d; }
        .btn-primary { padding: 12px 25px; background-color: #74b9ff; color: #242c3d; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); background-color: #818cf8; box-shadow: 0 10px 20px -5px rgba(116, 185, 255, 0.4); }
        .btn-primary:disabled { background: #adb5bd; cursor: not-allowed; }
        .btn-secondary { padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s ease; }
        .btn-secondary:hover { background-color: #5a6268; }
        .grid { display: grid; gap: 20px; margin-bottom: 25px; }
        .three-cols { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #333; }
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; font-family: 'Inter', sans-serif; transition: all 0.2s ease-in-out; }
        input:focus, select:focus { outline: none; border-color: #74b9ff; box-shadow: 0 0 0 3px rgba(116, 185, 255, 0.3); }
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; white-space: nowrap; }
        .data-table th { background-color: #f8f9fa; font-weight: 600; color: #333; }
        .data-table tbody tr:hover { background-color: #f1f3f5; }
        .order-name { font-weight: 600; color: #333; }
        .order-id { font-size: 0.8rem; color: #666; }
        .text-center { text-align: center; }
        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; color: white; }
        .message { padding: 12px 20px; margin-bottom: 20px; border-radius: 8px; border: 1px solid; display: flex; justify-content: space-between; align-items: center; }
        .message.success { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
        .message.error { background-color: #fee2e2; color: #991b1b; border-color: #fecaca; }
        .message button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }
        .no-data { text-align: center; padding: 40px; color: #666; }
        
        .qr-input-container { display: flex; gap: 15px; align-items: flex-end; }
        .scanned-order-details { margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; display: grid; gap: 10px; }
        .scanned-order-details div { font-size: 1.1rem; }
        .update-controls { display: flex; gap: 15px; align-items: flex-end; }
      `}</style>
    </div>
  );
}
{activeTab === "qr-scanner" && (
    <div className="tab-content">
        <div className="card">
        {!scannedOrder ? (
            <>
            <h3 className="card-title">Scan QR Code</h3>
            <div className="qr-input-container">
                <div style={{flex: 1}}>
                <label>QR Code Data:</label>
                <input 
                    type="text" 
                    placeholder="Scan or enter Order ID..." 
                    value={qrScanInput} 
                    onChange={(e) => setQrScanInput(e.target.value)} 
                    // THIS IS THE NEW LINE:
                    onKeyPress={(e) => e.key === 'Enter' && handleFetchOrder()} 
                    autoFocus 
                />
                </div>
                <button onClick={handleFetchOrder} disabled={loading || !qrScanInput.trim()} className="btn-primary">{loading ? "Finding..." : "Find Order"}</button>
            </div>
            </>
        ) : (
            // ... the rest of the QR scanner code remains the same
            <>
                <h3 className="card-title">Update Order Status</h3>
                <div className="scanned-order-details">
                    <div><strong>Order Name:</strong> {scannedOrder.name}</div>
                    <div><strong>Order ID:</strong> {scannedOrder.id}</div>
                    <div><strong>Current Status:</strong> <span className="status-badge" style={{backgroundColor: getStatusColor(scannedOrder.status)}}>{scannedOrder.status.replace("_", " ").toUpperCase()}</span></div>
                </div>
                <div className="update-controls">
                    <div style={{flex: 1}}>
                        <label>Set New Status:</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="started">Started</option>
                            <option value="washed">Washed</option>
                            <option value="dried">Dried</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="picked_up">Picked Up</option>
                        </select>
                    </div>
                    <button onClick={handleConfirmUpdate} disabled={loading} className="btn-primary">Confirm Update</button>
                    <button onClick={() => setScannedOrder(null)} className="btn-secondary">Scan Another</button>
                </div>
            </>
        )}
        </div>
    </div>
)}