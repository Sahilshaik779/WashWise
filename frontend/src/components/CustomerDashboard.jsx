import React, { useEffect, useState } from "react";
import { getMyOrders, changePassword } from "../api";

// --- SVG Icons ---
const WashWiseLogo = ({ small }) => ( <svg width={small ? "40" : "80"} height={small ? "40" : "80"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logo-gradient)" strokeWidth="1.5"/><path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 10.1642 8.21203 8.6132 9.875 7.82883" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/><defs><linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#81ECEC"/><stop offset="1" stopColor="#74B9FF"/></linearGradient></defs></svg>);
const IconOrders = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const IconHistory = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

const ImageModal = ({ src, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>×</button>
      <img src={src} alt="Enlarged QR Code" className="modal-image" />
    </div>
  </div>
);

export default function CustomerDashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("my-orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

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
    if (newPassword !== confirmPassword) return setMessage("New passwords do not match.");
    if (newPassword.length < 6) return setMessage("Password must be at least 6 characters.");
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

  const handleImageClick = (src) => {
    setModalImageSrc(`http://127.0.0.1:8000${src}`);
    setIsModalOpen(true);
  };
  const handleLogout = () => { localStorage.clear(); window.location.href = '/'; };

  const getStatusColor = (status) => ({ pending: "#ffc107", started: "#17a2b8", washed: "#6f42c1", dried: "#fd7e14", ready_for_pickup: "#28a745", picked_up: "#6c757d" })[status] || "#6c757d";
  const getStatusText = (status) => ({ pending: "Pending", started: "In Progress", washed: "Washed", dried: "Dried", ready_for_pickup: "Ready for Pickup", picked_up: "Completed" })[status] || status;
  const getProgressPercentage = (status) => ({ pending: 16, started: 33, washed: 50, dried: 66, ready_for_pickup: 83, picked_up: 100 })[status] || 0;

  const activeOrders = orders.filter(order => order.status !== "picked_up");
  const completedOrders = orders.filter(order => order.status === "picked_up");
  
  const TABS = [
    { id: "my-orders", label: "My Orders", icon: <IconOrders />, count: activeOrders.length },
    { id: "order-history", label: "Order History", icon: <IconHistory /> },
    { id: "settings", label: "Settings", icon: <IconSettings /> },
  ];

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];
  
  if (loading && orders.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {isModalOpen && <ImageModal src={modalImageSrc} onClose={() => setIsModalOpen(false)} />}
      <header className="top-bar">
        <div className="logo-section">
          <WashWiseLogo small />
          <span className="brand-name">WashWise</span>
        </div>
        <div className="user-section">
          <span className="user-role customer">Customer</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className={`dashboard-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar">
          <div className="sidebar-header">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={!isSidebarCollapsed} 
                onChange={() => setSidebarCollapsed(!isSidebarCollapsed)} 
              />
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
                  <span className="nav-icon-wrapper">
                    <span className="nav-icon">{tab.icon}</span>
                  </span>
                  <span className="nav-label">{tab.label}</span>
                  {tab.id === 'my-orders' && tab.count > 0 && <span className="nav-count">{tab.count}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="content-area">
          <h2 className="content-title">{currentTab.label}</h2>
          {(message || error) && (
              <div className={`message ${error ? 'error' : (message.includes("successfully") ? 'success' : 'info')}`}>
                  <span>{error || message}</span>
                  <button onClick={() => { setMessage(""); setError(""); }}>×</button>
              </div>
          )}
          {activeTab === "my-orders" && ( <div className="tab-content">{activeOrders.length === 0 ? (<div className="card no-data-card"><h3>No Active Orders</h3><p>You currently don't have any active orders.</p></div>) : (<div className="orders-grid">{activeOrders.map((order) => (<div className="card order-card" key={order.id}><div className="card-header"><div><h3>{order.name}</h3><p className="order-id">ID: {order.id.substring(0, 12)}...</p></div><span className="status-badge" style={{backgroundColor: getStatusColor(order.status)}}>{getStatusText(order.status)}</span></div><div className="card-body"><div className="info-grid"><div className="info-item"><span>Date</span><strong>{new Date(order.created_at).toLocaleDateString()}</strong></div><div className="info-item"><span>Items</span><strong>{order.clothes_count} pieces</strong></div></div><div className="progress-bar-container"><div className="progress-labels"><span>Progress</span><span>{getProgressPercentage(order.status)}%</span></div><div className="progress-bar"><div className="progress-bar-fill" style={{width: `${getProgressPercentage(order.status)}%`, backgroundColor: getStatusColor(order.status)}}></div></div></div></div>{order.qr_code_url && (<div className="card-footer"><p>Your QR Code for Pickup</p><div className="qr-code-box" style={{borderColor: getStatusColor(order.status)}}><img src={`http://127.0.0.1:8000${order.qr_code_url}`} alt="Order QR Code" className="qr-image" onClick={() => handleImageClick(order.qr_code_url)}/></div></div>)}</div>))}</div>)}</div>)}
          {activeTab === "order-history" && ( <div className="tab-content"><div className="card">{completedOrders.length === 0 ? (<div className="no-data-card small"><h3>No Completed Orders Yet</h3><p>Your past orders will appear here.</p></div>) : (<div className="table-container"><table className="data-table"><thead><tr><th>Order Name</th><th>Date</th><th>Items</th><th>Status</th></tr></thead><tbody>{completedOrders.map(order => (<tr key={order.id}><td><div className="order-name">{order.name}</div><div className="order-id">{order.id.substring(0, 12)}...</div></td><td className="text-center">{new Date(order.created_at).toLocaleDateString()}</td><td className="text-center">{order.clothes_count}</td><td><span className="status-badge" style={{backgroundColor: getStatusColor(order.status)}}>Completed</span></td></tr>))}</tbody></table></div>)}</div></div>)}
          {activeTab === "settings" && ( <div className="tab-content"><div className="card"><h3 className="card-title">Change Password</h3><form onSubmit={handleChangePassword}><div className="grid three-cols"><div><label>Current Password:</label><input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required/></div><div><label>New Password:</label><input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/></div><div><label>Confirm New Password:</label><input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/></div></div><button type="submit" className="btn-primary">Update Password</button></form></div></div>)}
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
        .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 65px; background-color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; border-bottom: 1px solid #dee2e6; z-index: 1000; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #242c3d; }
        .user-section { display: flex; align-items: center; gap: 15px; }
        .user-role { font-weight: 600; padding: 6px 12px; border-radius: 6px; }
        .user-role.customer { color: #155724; background-color: #d4edda; }
        .btn-logout { padding: 8px 15px; background-color: transparent; color: #dc3545; border: 1px solid #dc3545; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-logout:hover { background-color: #dc3545; color: #fff; }

        .dashboard-layout { display: flex; height: 100%; padding-top: 65px; }
        .sidebar { width: 260px; background-color: #242c3d; color: #fff; padding: 10px; transition: width 0.3s ease-in-out; overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column; }
        .content-area { flex-grow: 1; padding: 30px; overflow-y: auto; }
        .dashboard-layout.collapsed .sidebar { width: 70px; }
        
        .sidebar-header { display: flex; justify-content: flex-end; padding: 5px; height: 44px; margin-bottom: 15px; align-items: center; }
        .dashboard-layout.collapsed .sidebar-header { justify-content: center; }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #556b8d; transition: .4s; border-radius: 28px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #74b9ff; }
        input:checked + .slider:before { transform: translateX(22px); }
        
        .sidebar-nav { list-style: none; padding: 0; margin: 0; }
        .sidebar-nav button { display: flex; align-items: center; gap: 15px; width: 100%; padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; background: transparent; border: none; color: rgba(255, 255, 255, 0.7); font-size: 1rem; font-weight: 500; cursor: pointer; text-align: left; transition: background-color 0.2s ease, color 0.2s ease; white-space: nowrap; }
        .sidebar-nav button:hover { background-color: rgba(255, 255, 255, 0.1); color: #fff; }
        .sidebar-nav button.active { background-color: #007bff; color: #fff; font-weight: 600; }

        .nav-icon-wrapper { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; transition: background-color 0.2s ease; }
        .nav-icon { min-width: 24px; height: 24px; }
        
        .dashboard-layout.collapsed .sidebar-nav button { display: grid; place-items: center; width: 100%; height: 50px; padding: 0; margin-bottom: 10px; }
        .dashboard-layout.collapsed .nav-label, .dashboard-layout.collapsed .nav-count { display: none; }
        .dashboard-layout.collapsed .sidebar-nav button.active .nav-icon-wrapper { background-color: #74b9ff; border-radius: 50%; }
        .dashboard-layout.collapsed .sidebar-nav button.active .nav-icon { color: #242c3d; }
        
        .nav-count { margin-left: auto; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 2px 8px; font-size: 0.8rem; }
        
        .content-title { margin: 0 0 30px 0; font-size: 2rem; color: #242c3d; }
        .tab-content { display: flex; flex-direction: column; gap: 25px; }
        .card { background-color: #fff; border-radius: 15px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .card-title { margin: 0 0 25px 0; font-size: 1.3rem; font-weight: 600; }
        
        .orders-grid { display: grid; gap: 25px; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); }
        .order-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .card-header h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #333; }
        .order-id { font-size: 0.85rem; color: #666; margin-top: 5px; font-family: monospace; }
        .status-badge { padding: 8px 16px; border-radius: 25px; font-size: 0.85rem; font-weight: bold; color: white; white-space: nowrap; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .info-item { padding: 12px; background-color: #f8f9fa; border-radius: 8px; text-align: center; }
        .info-item span { font-size: 0.8rem; color: #666; margin-bottom: 5px; display: block; }
        .info-item strong { font-weight: 600; color: #333; }
        
        .progress-bar-container { margin-bottom: 15px; }
        .progress-labels { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.9rem; font-weight: 600; color: #333; }
        .progress-bar { width: 100%; height: 10px; background-color: #e9ecef; border-radius: 5px; overflow: hidden; }
        .progress-bar-fill { height: 100%; transition: width 0.5s ease; border-radius: 5px; }
        
        .card-footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; }
        .card-footer p { font-size: 0.9rem; color: #666; margin: 0 0 12px 0; font-weight: 600; }
        .qr-code-box { display: inline-block; padding: 10px; background-color: white; border-radius: 12px; border-width: 3px; border-style: solid; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .qr-image { width: 100px; height: 100px; display: block; cursor: pointer; }

        .no-data-card { text-align: center; padding: 60px 20px; }
        .no-data-card.small { padding: 40px 20px; }
        .no-data-card h3 { color: #666; margin: 0 0 10px 0; }
        .no-data-card p { color: #999; margin: 0; }

        .btn-primary { padding: 15px 30px; background-color: #28a745; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3); transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); background-color: #218838; }
        .grid { display: grid; gap: 20px; margin-bottom: 30px; }
        .three-cols { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 1rem; }
        input { width: 100%; padding: 15px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 1rem; transition: border-color 0.2s ease; }
        input:focus { outline: none; border-color: #28a745; }

        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        .data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; white-space: nowrap; }
        .data-table th { background-color: #f8f9fa; font-weight: 600; color: #333; border-bottom-width: 2px; }
        .data-table .text-center { text-align: center; }

        .message { padding: 15px 20px; margin-bottom: 25px; border-radius: 10px; border: 1px solid; display: flex; justify-content: space-between; align-items: center; }
        .message.success { background-color: #d4edda; color: #155724; border-color: #c3e6cb; }
        .message.error { background-color: #f8d7da; color: #721c24; border-color: #f5c6cb; }
        .message.info { background-color: #fff3cd; color: #856404; border-color: #ffeeba; }
        .message button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }
        
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; color: #666; font-size: 1.2rem; }
        .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 2000; animation: fadeIn 0.3s ease; }
        .modal-content { background-color: white; padding: 20px; border-radius: 15px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .modal-image { width: 100%; max-width: 300px; height: auto; border-radius: 10px; }
        .modal-close { position: absolute; top: -18px; right: -18px; background-color: white; border: none; color: #333; width: 36px; height: 36px; border-radius: 50%; font-size: 1.5rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.2s ease; display: grid; place-items: center; padding: 0; line-height: 1; }
        .modal-close:hover { transform: scale(1.1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}