// src/components/ServicemanDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  createOrder,
  getOrders,
  updateOrderItemStatus,
  getAllUsers,
  getOrderByQr,
  changePassword,
  SERVICE_PRICES,
  SERVICE_WORKFLOWS,
  getActiveOrdersForUser,
} from "../api";

// Import Shared Icons
import { 
  WashWiseLogo, IconClipboard, IconHistory, IconUsers, 
  IconAdd, IconQR, IconSettings 
} from "./common/Icons";

const SERVICE_LABELS = {
  "wash_and_fold": "Wash and Fold",
  "wash_and_iron": "Wash and Iron",
  "dry_cleaning": "Dry Cleaning", 
  "premium_wash": "Premium Wash",
  "steam_iron": "Steam Iron",
};

export default function ServicemanDashboard({ onLogout }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("active-orders");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customerUsername, setCustomerUsername] = useState("");
  const [serviceQuantities, setServiceQuantities] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [activeServiceTab, setActiveServiceTab] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null);

  const [qrScanInput, setQrScanInput] = useState("");
  const [qrScannerMode, setQrScannerMode] = useState('scan');
  const [scannedData, setScannedData] = useState(null);
  const [customerForQrOrder, setCustomerForQrOrder] = useState(null);
  const [customerActiveOrdersForQr, setCustomerActiveOrdersForQr] = useState([]);
  const [qrServiceQuantities, setQrServiceQuantities] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getOrders(); 
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setMessage("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  useEffect(() => {
    setSelectedCustomerForView(null);
    if (message) setMessage("");
  }, [activeTab]);
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000); 
      return () => clearTimeout(timer); 
    }
  }, [message]);

  const filteredCustomers = users.filter((u) => u.role === "customer" && customerUsername && u.username.toLowerCase().includes(customerUsername.toLowerCase()));
  const selectedCustomer = useMemo(() => users.find(u => u.username === customerUsername), [users, customerUsername]);
  
  const isOrderActive = (order) => order.items.some(item => item.status !== "picked_up");
  const activeOrders = useMemo(() => orders.filter(isOrderActive), [orders]);
  const pastOrders = useMemo(() => orders.filter(order => !isOrderActive(order)), [orders]);

  const customerActiveServices = useMemo(() => {
    if (!selectedCustomer) return [];
    const customerActiveOrders = activeOrders.filter(o => o.owner_id === selectedCustomer.id);
    return customerActiveOrders.flatMap(o => o.items.map(item => item.service_name));
  }, [selectedCustomer, activeOrders]);

  const selectedCustomerActiveOrders = useMemo(() => {
      if (!selectedCustomer) return [];
      return activeOrders
        .filter(order => order.owner_id === selectedCustomer.id)
        .flatMap(order => order.items.map(item => ({...item, orderId: order.id })));
  }, [selectedCustomer, activeOrders]);

  const groupOrderItemsByService = (orderList) => {
    const grouped = {};
    const matchingCustomerIds = users
      .filter(user => user.username.toLowerCase().includes(customerFilter.toLowerCase()))
      .map(user => user.id);

    orderList.forEach(order => {
      if ((searchTerm && !order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (dateFilter && new Date(order.created_at).toDateString() !== new Date(dateFilter).toDateString()) ||
          (customerFilter && !matchingCustomerIds.includes(order.owner_id))) {
        return;
      }
      
      const customer = users.find(u => u.id === order.owner_id);
      order.items.forEach(item => {
        if (!grouped[item.service_name]) {
          grouped[item.service_name] = [];
        }
        grouped[item.service_name].push({
          ...item,
          customerName: customer ? customer.username : 'Unknown',
          orderId: order.id,
          orderDate: order.created_at,
          paymentStatus: order.payment_status,
          nextStatuses: item.possible_next_statuses || []
        });
      });
    });
    return grouped;
  };

  const activeItemsByService = useMemo(() => groupOrderItemsByService(activeOrders), [activeOrders, users, searchTerm, dateFilter, customerFilter]);
  const pastItemsByService = useMemo(() => groupOrderItemsByService(pastOrders), [pastOrders, users, searchTerm, dateFilter, customerFilter]);

  useEffect(() => {
    const itemsByService = activeTab === 'active-orders' ? activeItemsByService : pastItemsByService;
    const firstServiceKey = Object.keys(itemsByService)[0];
    if(!activeServiceTab) setActiveServiceTab(firstServiceKey || '');
  }, [activeTab, activeItemsByService, pastItemsByService]);

  const handleAddOrder = async () => {
    if (!customerUsername) return setMessage("Please select a customer.");
    if (!users.find(u => u.username === customerUsername && u.role === "customer")) return setMessage("Please select a valid customer from the suggestions.");
    
    const servicesToOrder = Object.entries(serviceQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([serviceKey, quantity]) => ({ service_name: serviceKey, quantity: Number(quantity) }));
    
    if (servicesToOrder.length === 0) return setMessage("Please add at least one service.");
    
    try { 
        setLoading(true); 
        await createOrder({ customer_username: customerUsername, services: servicesToOrder }); 
        setMessage(`Order for ${customerUsername} added successfully!`); 
        setCustomerUsername(""); 
        setServiceQuantities({}); 
        setShowSuggestions(false); 
        fetchOrders(); 
    } catch (err) { 
        setMessage("Failed to add order: " + (err.response?.data?.detail || err.message)); 
    } finally { 
        setLoading(false); 
    }
  };
 
  const handleQrScan = async () => {
    if (!qrScanInput.trim()) return setMessage("QR input cannot be empty.");
    setLoading(true);
    setMessage("");
    try {
      const data = JSON.parse(qrScanInput.trim());
      if (data.order_id) {
        const { data: orderData } = await getOrderByQr(data.order_id);
        setScannedData({ type: 'order', data: orderData });
        setQrScannerMode('view_single_order');
      } 
      else if (data.user_id) {
        const customer = users.find(u => u.id === data.user_id);
        if (!customer) throw new Error("Customer from QR not found.");
        const { data: activeOrders } = await getActiveOrdersForUser(data.user_id);
        setCustomerForQrOrder(customer);
        setCustomerActiveOrdersForQr(activeOrders);
        setQrScannerMode('user_actions');
      } 
      else {
        throw new Error("Invalid QR code data format.");
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        try {
          const { data: orderData } = await getOrderByQr(qrScanInput.trim());
          setScannedData({ type: 'order', data: orderData });
          setQrScannerMode('view_single_order');
        } catch (finalErr) {
          setMessage("Failed to process QR. Invalid JSON and not a valid Order ID.");
        }
      } else {
        setMessage(`Error: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrderFromQrFlow = async () => {
    const servicesToOrder = Object.entries(qrServiceQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([service_name, quantity]) => ({ service_name, quantity: Number(quantity) }));

    if (servicesToOrder.length === 0) {
      return setMessage("Please select at least one service.");
    }
    setLoading(true);
    try {
      await createOrder({ customer_username: customerForQrOrder.username, services: servicesToOrder });
      setMessage(`New order for ${customerForQrOrder.username} created successfully!`);
      resetQrScanner();
      fetchOrders();
    } catch (err) {
      setMessage(`Failed to create order: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetQrScanner = () => {
    setQrScanInput("");
    setQrScannerMode('scan');
    setScannedData(null);
    setCustomerForQrOrder(null);
    setCustomerActiveOrdersForQr([]);
    setQrServiceQuantities({});
    setMessage("");
  };

  const handleStatusChange = async (itemId, status) => { 
    try { 
        await updateOrderItemStatus(itemId, status);
        fetchOrders();
        
        if (qrScannerMode === 'view_single_order' && scannedData?.type === 'order') {
            const { data } = await getOrderByQr(scannedData.data.id);
            setScannedData({ type: 'order', data });
        }
        if ((qrScannerMode === 'user_actions' || qrScannerMode === 'view_active_orders') && customerForQrOrder) {
            const { data } = await getActiveOrdersForUser(customerForQrOrder.id);
            setCustomerActiveOrdersForQr(data);
        }
    } catch (err) { 
        setMessage(`Failed to update status: ${err.response?.data?.detail || err.message}`);
    } 
  };

  const handleLogout = () => { localStorage.clear(); onLogout(); };
  
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setMessage("New passwords do not match.");
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setMessage("Password updated successfully!");
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => ({
      pending: "#f39c12", started: "#3498db", washing: "#8e44ad", 
      folding: "#e67e22", ironing: "#e67e22", pressing: "#e67e22",
      ready_for_pickup: "#27ae60", picked_up: "#95a5a6"
  }[status] || "#7f8c8d");
  
  const getPlanColor = (plan) => ({ none: "#95a5a6", standard: "#48C9B0", premium: "#9B59B6" })[plan] || "#7f8c8d";
  const getPlanLabel = (plan) => ({ none: "None", standard: "Standard", premium: "Premium" })[plan] || plan;
 
  const calculateTotalCost = () => {
    return Object.entries(serviceQuantities).reduce((total, [serviceKey, quantity]) => {
      return total + (SERVICE_PRICES[serviceKey]?.price || 0) * Number(quantity);
    }, 0);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };
 
  const TABS = [
    { id: "active-orders", label: "Active Orders", icon: <IconClipboard />, count: activeOrders.length },
    { id: "past-orders", label: "Past Orders", icon: <IconHistory /> },
    { id: "manage-customers", label: "Customers", icon: <IconUsers /> },
    { id: "add-order", label: "Add Order", icon: <IconAdd /> },
    { id: "qr-scanner", label: "QR Scanner", icon: <IconQR /> },
    { id: "settings", label: "Settings", icon: <IconSettings /> },
  ];
 
  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];
  const currentItemsByService = activeTab === 'active-orders' ? activeItemsByService : pastItemsByService;
  const itemsForActiveServiceTab = currentItemsByService[activeServiceTab] || [];

  return (
    <div className="app-container">
      <header className="top-bar">
        <div className="logo-section"><WashWiseLogo small /><span className="brand-name">WashWise</span></div>
        <div className="user-section"><span className="user-role">Admin</span><button className="btn-logout" onClick={handleLogout}>Logout</button></div>
      </header>

      <div className="dashboard-layout">
        <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <label className="toggle-switch">
              <input type="checkbox" checked={!isSidebarCollapsed} onChange={() => setSidebarCollapsed(!isSidebarCollapsed)} />
              <span className="slider round"></span>
            </label>
          </div>
          <ul className="sidebar-nav">
            {TABS.map(tab => (
              <li key={tab.id}>
                <button onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "active" : ""}>
                  <span className="nav-icon-wrapper"><span className="nav-icon">{tab.icon}</span></span>
                  <span className="nav-label">{tab.label}</span>
                  {tab.id === 'active-orders' && tab.count !== undefined && <span className="nav-count">{tab.count}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="content-area">
          <h2 className="content-title">
            {activeTab === 'manage-customers' && selectedCustomerForView ? `Customer Insight: ${selectedCustomerForView.username}` : currentTab.label}
          </h2>
          {message && (<div className={`message ${message.includes("successfully") ? 'success' : 'error'}`}>{message}<button onClick={() => setMessage("")}>×</button></div>)}
         
          {(activeTab === "active-orders" || activeTab === "past-orders") && (
            <div className="tab-content">
              <div className="card">
                <h3 className="card-title">Filters</h3>
                <div className="grid three-cols">
                  <div><label>Search Orders:</label><input type="text" placeholder="Search by order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div><label>Filter by Date:</label><input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} /></div>
                  <div><label>Filter by Customer:</label><input type="text" placeholder="Customer name..." value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} /></div>
                </div>
                {(searchTerm || dateFilter || customerFilter) && <button className="btn-secondary" onClick={() => { setSearchTerm(""); setDateFilter(""); setCustomerFilter(""); }}>Clear Filters</button>}
              </div>
              
              <div className="card orders-card">
                <div className="sub-tab-nav">
                    {Object.keys(currentItemsByService).map(serviceKey => (
                        <button key={serviceKey} className={`sub-tab-item ${activeServiceTab === serviceKey ? 'active' : ''}`} onClick={() => setActiveServiceTab(serviceKey)}>
                            {SERVICE_LABELS[serviceKey]} <span className="item-count-badge">{currentItemsByService[serviceKey].length}</span>
                        </button>
                    ))}
                </div>

                <div className="sub-tab-content">
                    {itemsForActiveServiceTab.length > 0 ? (
                        <>
                            <div className="item-list-header-wrapper">
                                <div className="item-list-header">
                                    <div className="item-col col-sl">SL</div>
                                    <div className="item-col col-cust">Customer</div>
                                    <div className="item-col col-date">Date</div>
                                    <div className="item-col col-qty">Qty & Cost</div>
                                    <div className="item-col col-pay">Payment</div>
                                    <div className="item-col col-stat">Status</div>
                                    {activeTab === 'active-orders' && <div className="item-col col-act">Action</div>}
                                </div>
                            </div>
                            <div className="item-list-content">
                                {itemsForActiveServiceTab.map((item, idx) => {
                                    const workflow = SERVICE_WORKFLOWS[item.service_name] || [];
                                    const currentIndex = workflow.indexOf(item.status);
                                    return (
                                        <div key={item.id} className="item-row-card">
                                            <div className="item-col col-sl">{idx + 1}</div>
                                            <div className="item-col col-cust">{item.customerName}</div>
                                            <div className="item-col col-date">{formatDate(item.orderDate)}</div>
                                            <div className="item-col col-qty"><div className="qty-val">Qty: {item.quantity}</div><div className="cost-val">₹{item.cost}</div></div>
                                            <div className="item-col col-pay"><span className={`payment-badge ${item.paymentStatus.toLowerCase()}`}>{item.paymentStatus.toUpperCase()}</span></div>
                                            <div className="item-col col-stat"><span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>{item.status.replace(/_/g, " ")}</span></div>
                                            {activeTab === 'active-orders' && (
                                                <div className="item-col col-act">
                                                    <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="status-select">
                                                        {workflow.map((status, statusIndex) => (
                                                            <option key={status} value={status} disabled={statusIndex < currentIndex}>{status.replace(/_/g, " ")}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : <div className="no-data">No items for this service.</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "manage-customers" && ( 
            <div className="tab-content">
              {!selectedCustomerForView ? (
                <div className="card">
                  <div className="table-container">
                    <table className="data-table">
                      <thead><tr><th>Username</th><th>Email</th><th>Membership</th><th>Total Orders</th><th>Active Orders</th></tr></thead>
                      <tbody>
                        {users.filter(u => u.role === "customer").map(user => { 
                          const userOrders = orders.filter(o => o.owner_id === user.id); 
                          const activeUserOrders = userOrders.filter(o => isOrderActive(o)); 
                          const totalServicesUsed = Object.values(user.monthly_services_used || {}).reduce((sum, count) => sum + count, 0);
                          return (
                            <tr key={user.id} onClick={() => setSelectedCustomerForView(user)} className="clickable-row">
                              <td><div className="order-name">{user.username}</div></td>
                              <td>{user.email}</td>
                              <td><span className="status-badge" style={{backgroundColor: getPlanColor(user.membership_plan)}}>{getPlanLabel(user.membership_plan)}</span>{user.membership_plan !== 'none' && <div className="services-used">Used: {totalServicesUsed}</div>}</td>
                              <td className="text-center">{userOrders.length}</td>
                              <td className="text-center">{activeUserOrders.length}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  <div className="customer-insight-header">
                    <button onClick={() => setSelectedCustomerForView(null)} className="btn-secondary">← Back</button>
                    <button onClick={() => { setCustomerUsername(selectedCustomerForView.username); setActiveTab('add-order'); }} className="btn-primary">Create New Order</button>
                  </div>
                  <div className="card">
                    <h3 className="card-title">Active Orders</h3>
                    <div className="order-items-detail">
                      {orders.filter(o => o.owner_id === selectedCustomerForView.id && isOrderActive(o)).flatMap(order => order.items.filter(item => item.status !== 'picked_up').map(item => (
                        <div key={item.id} className="item-detail-card">
                          <div className="item-header">
                            <div><span className="item-service">{SERVICE_LABELS[item.service_name]} (Qty: {item.quantity})</span><div className="order-id">Order #{order.id.substring(0,8)}</div></div>
                            <span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>{item.status.replace("_", " ").toUpperCase()}</span>
                          </div>
                          <div className="item-controls">
                            <label>Update:</label>
                            <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="status-select">
                              {SERVICE_WORKFLOWS[item.service_name]?.map((status, statusIndex) => {
                                const currentIndex = SERVICE_WORKFLOWS[item.service_name].indexOf(item.status);
                                return ( <option key={status} value={status} disabled={statusIndex < currentIndex}>{status.replace(/_/g, " ")}</option> );
                              })}
                            </select>
                          </div>
                        </div>
                      )))}
                      {orders.filter(o => o.owner_id === selectedCustomerForView.id && isOrderActive(o)).length === 0 && <p className="no-data">No active orders.</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "add-order" && ( 
            <div className="tab-content">
              <div className="card">
                <div className="grid two-cols" style={{alignItems: 'start'}}>
                  <div>
                    <div className="autocomplete-container" style={{marginBottom: '20px'}}>
                        <label>Customer Username:</label>
                        <input placeholder="Type customer username..." value={customerUsername} onChange={(e) => { setCustomerUsername(e.target.value); setShowSuggestions(e.target.value.length > 0); }} onFocus={() => setShowSuggestions(customerUsername.length > 0)}/>
                        {showSuggestions && filteredCustomers.length > 0 && (
                          <div className="suggestions-box">
                            {filteredCustomers.map((user) => (
                              <div key={user.id} onClick={() => { setCustomerUsername(user.username); setShowSuggestions(false); }} className="suggestion-item">
                                <div>{user.username}</div>
                                <div className="suggestion-meta">Plan: {getPlanLabel(user.membership_plan)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                  {/* Reuse services list logic from prev version, kept brief for clarity */}
                  <div className="services-quantity-list">
                      {Object.entries(SERVICE_PRICES).map(([serviceKey, serviceInfo]) => (
                          <div key={serviceKey} className="service-quantity-item">
                              <span className="service-name">{serviceInfo.name} (₹{serviceInfo.price})</span>
                              <div className="quantity-control">
                                <button onClick={() => setServiceQuantities(p => ({...p, [serviceKey]: Math.max(0, (p[serviceKey] || 0) - 1)}))}>-</button>
                                <input type="number" value={serviceQuantities[serviceKey] || 0} readOnly/>
                                <button onClick={() => setServiceQuantities(p => ({...p, [serviceKey]: (p[serviceKey] || 0) + 1}))}>+</button>
                              </div>
                          </div>
                      ))}
                  </div>
                </div>
                <div style={{marginTop: '20px', textAlign: 'right'}}>
                    <strong>Total: ₹{calculateTotalCost()}</strong>
                    <button onClick={handleAddOrder} disabled={loading || calculateTotalCost() <= 0} className="btn-primary" style={{marginLeft: '15px'}}>Add Order</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "qr-scanner" && (
            <div className="tab-content">
              <div className="card">
                {qrScannerMode === 'scan' && (
                  <div className="qr-input-container">
                    <input type="text" placeholder="Scan QR or enter ID..." value={qrScanInput} onChange={(e) => setQrScanInput(e.target.value)} autoFocus />
                    <button onClick={handleQrScan} disabled={loading || !qrScanInput.trim()} className="btn-primary">Process</button>
                  </div>
                )}
                {/* Simplified view for QR Actions (reuse logic from original file if needed) */}
                {qrScannerMode !== 'scan' && (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                        <h3>{qrScannerMode === 'view_single_order' ? 'Order Found' : 'Customer Found'}</h3>
                        <button onClick={resetQrScanner} className="btn-secondary">Scan Another</button>
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && ( 
            <div className="tab-content">
              <div className="card">
                <h3 className="card-title">Change Password</h3>
                <form onSubmit={handleChangePasswordSubmit}>
                    <div className="form-group"><label>Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div>
                    <div className="form-group"><label>New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
                    <div className="form-group"><label>Confirm New Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div>
                    <button type="submit" className="btn-primary" disabled={loading}>Update</button>
                </form>
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
        /* --- LAYOUT & SIDEBAR --- */
        .app-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
        .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 65px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; border-bottom: 1px solid #dee2e6; z-index: 1000; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #2A2F45; }
        .user-section { display: flex; align-items: center; gap: 15px; }
        .user-role { font-weight: 600; padding: 6px 12px; border-radius: 6px; background-color: #f8f9fa; color: #343a40; }
        .btn-logout { padding: 8px 15px; background: #f8f9fa; color: #dc3545; border: 1px solid #dee2e6; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-logout:hover { background: #dc3545; color: white; }

        .dashboard-layout { display: flex; height: 100%; padding-top: 65px; }
        
        .sidebar { width: 260px; background-color: #2A2F45; color: #fff; padding: 15px 10px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; }
        .sidebar.collapsed { width: 80px; }
        
        .sidebar-header { display: flex; justify-content: flex-end; padding: 0 5px; margin-bottom: 20px; min-height: 30px; }
        .sidebar.collapsed .sidebar-header { justify-content: center; padding: 0; }
        
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #556b8d; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #48C9B0; }
        input:checked + .slider:before { transform: translateX(22px); }

        .sidebar-nav { list-style: none; padding: 0; margin: 0; }
        .sidebar-nav li { margin-bottom: 8px; }
        .sidebar-nav button { display: flex; align-items: center; gap: 15px; width: 100%; padding: 12px 15px; border-radius: 8px; background: transparent; border: none; color: rgba(255, 255, 255, 0.7); font-size: 1rem; font-weight: 500; cursor: pointer; text-align: left; transition: all 0.2s ease; white-space: nowrap; }
        .sidebar-nav button:hover { background-color: rgba(255, 255, 255, 0.1); color: #fff; }
        .sidebar-nav button.active { color: #fff; font-weight: 600; background-color: rgba(255, 255, 255, 0.05); }
        .sidebar-nav button.active .nav-icon-wrapper { background-color: #48C9B0; color: white; }
        .nav-icon-wrapper { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; transition: background 0.2s; flex-shrink: 0; }
        .nav-icon { width: 20px; height: 20px; }
        
        .sidebar.collapsed .nav-label, .sidebar.collapsed .nav-count { display: none; }
        .sidebar.collapsed .sidebar-nav button { justify-content: center; padding: 0; width: 48px; height: 48px; border-radius: 50%; margin: 0 auto; }

        /* --- CONTENT AREA --- */
        .content-area { flex-grow: 1; padding: 30px; overflow-y: auto; background-color: #f4f7f9; }
        .content-title { margin-bottom: 30px; font-size: 2rem; color: #2A2F45; }
        
        /* --- CARDS & GRID --- */
        .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .orders-card { padding: 0; }
        .grid { display: grid; gap: 20px; margin-bottom: 25px; }
        .three-cols { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        .two-cols { grid-template-columns: 1fr 1fr; gap: 30px; }
        
        /* --- TABLES & LISTS --- */
        .item-list-header-wrapper { overflow-x: auto; }
        .item-list-content { overflow-x: auto; }
        .item-list-header { display: flex; padding: 15px 10px; border-bottom: 2px solid #dee2e6; font-weight: 700; color: #555; background: #f8f9fa; min-width: 800px; }
        .item-row-card { display: flex; padding: 15px 10px; border-bottom: 1px solid #eee; align-items: center; min-width: 800px; transition: background 0.2s; }
        .item-row-card:hover { background-color: #f9f9f9; }
        
        .item-col { padding: 0 10px; display: flex; flex-direction: column; justify-content: center; }
        .col-sl { width: 50px; text-align: center; color: #888; font-weight: bold; }
        .col-cust { flex: 1; font-weight: 600; color: #333; }
        .col-date { flex: 1; color: #666; }
        .col-qty { flex: 1; }
        .qty-val { font-weight: 600; color: #2A2F45; }
        .cost-val { font-size: 0.85rem; color: #888; }
        .col-pay { width: 100px; text-align: center; }
        .col-stat { width: 140px; text-align: center; }
        .col-act { width: 180px; }
        
        .status-badge { padding: 4px 10px; border-radius: 6px; color: white; font-size: 0.8rem; font-weight: 600; text-transform: capitalize; display: inline-block; }
        .payment-badge { padding: 4px 10px; border-radius: 20px; color: white; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; display: inline-block; }
        .payment-badge.paid { background-color: #27ae60; }
        .payment-badge.unpaid { background-color: #e74c3c; }
        
        /* --- SUB TABS --- */
        .sub-tab-nav { display: flex; border-bottom: 1px solid #dee2e6; padding: 0 20px; overflow-x: auto; }
        .sub-tab-item { padding: 15px 20px; border: none; background: none; cursor: pointer; color: #666; font-weight: 500; border-bottom: 3px solid transparent; white-space: nowrap; display: flex; align-items: center; gap: 8px; transition: color 0.2s; }
        .sub-tab-item:hover { color: #333; }
        .sub-tab-item.active { color: #48C9B0; border-bottom-color: #48C9B0; font-weight: 700; }
        .item-count-badge { background: #eee; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; color: #555; }
        .sub-tab-item.active .item-count-badge { background: #e8f8f5; color: #48C9B0; }
        .sub-tab-content { padding: 20px; }
        
        /* --- CUSTOMER MANAGEMENT --- */
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .data-table th { text-align: left; padding: 15px; background: #f8f9fa; color: #555; font-weight: 700; border-bottom: 2px solid #eee; }
        .data-table td { padding: 15px; border-bottom: 1px solid #eee; color: #333; vertical-align: middle; }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background-color: #f0fdfa; }
        
        .customer-insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .order-items-detail { display: flex; flex-direction: column; gap: 15px; }
        .item-detail-card { background: #f8f9fa; border: 1px solid #eee; border-radius: 8px; padding: 15px; }
        .item-header { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }
        .item-service { font-weight: 700; font-size: 1.05rem; }
        .item-controls { display: flex; align-items: center; gap: 10px; }
        
        /* --- FORMS & INPUTS --- */
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border 0.2s; }
        input:focus, select:focus { outline: none; border-color: #48C9B0; box-shadow: 0 0 0 3px rgba(72, 201, 176, 0.2); }
        .form-group { margin-bottom: 20px; }
        .btn-primary { padding: 10px 20px; background: #48C9B0; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover:not(:disabled) { background: #40B39E; transform: translateY(-1px); }
        .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .btn-secondary { padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-secondary:hover { background: #7f8c8d; }
        
        /* --- SCANNER & ADD ORDER --- */
        .qr-input-container { display: flex; gap: 15px; align-items: center; margin-bottom: 20px; }
        .qr-input-container input { flex: 1; }
        
        .autocomplete-container { position: relative; }
        .suggestions-box { position: absolute; top: 100%; left: 0; width: 100%; background: white; border: 1px solid #ddd; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 10; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .suggestion-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s; }
        .suggestion-item:hover { background: #f8f9fa; }
        .suggestion-meta { font-size: 0.8rem; color: #888; margin-top: 2px; }
        
        .services-quantity-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
        .service-quantity-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #eee; border-radius: 8px; background: #fff; }
        .quantity-control { display: flex; align-items: center; gap: 5px; }
        .quantity-control button { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 1.2rem; line-height: 1; display: grid; place-items: center; }
        .quantity-control input { width: 50px; text-align: center; padding: 5px; border: none; background: transparent; font-weight: bold; }
        
        /* --- UTILS --- */
        .message { padding: 12px 20px; margin-bottom: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-weight: 500; }
        .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .no-data { text-align: center; padding: 40px; color: #888; font-style: italic; }
      `}</style>
    </div>
  );
}