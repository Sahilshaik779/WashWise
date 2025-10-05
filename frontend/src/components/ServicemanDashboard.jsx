import React, { useEffect, useState, useMemo } from "react";
import {
  createOrder,
  getOrders,
  updateOrderItemStatus,
  getAllUsers,
  getOrderByQr,
  changePassword,
  SERVICE_PRICES,
  getActiveOrdersForUser,
} from "../api";

const SERVICE_LABELS = {
  "wash_and_fold": "Wash and Fold",
  "wash_and_iron": "Wash and Iron",
  "dry_cleaning": "Dry Cleaning", 
  "premium_wash": "Premium Wash",
  "steam_iron": "Steam Iron",
};

const SERVICE_WORKFLOWS = {
    "wash_and_fold": ["pending", "started", "washing", "folding", "ready_for_pickup", "picked_up"],
    "wash_and_iron": ["pending", "started", "washing", "ironing", "ready_for_pickup", "picked_up"],
    "premium_wash": ["pending", "started", "inspection", "pre_treatment", "washing", "drying", "quality_check", "ready_for_pickup", "picked_up"],
    "dry_cleaning": ["pending", "started", "tagging", "pre_treatment", "dry_cleaning", "pressing", "finishing", "ready_for_pickup", "picked_up"],
    "steam_iron": ["pending", "started", "steaming", "pressing", "finishing", "ready_for_pickup", "picked_up"]
};

const WashWiseLogo = ({ small }) => ( <svg width={small ? "40" : "80"} height={small ? "40" : "80"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logo-gradient)" strokeWidth="1.5"/><path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 10.1642 8.21203 8.6132 9.875 7.82883" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/><defs><linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#81ECEC"/><stop offset="1" stopColor="#74B9FF"/></linearGradient></defs></svg>);
const IconClipboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const IconHistory = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconAdd = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconQR = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><path d="M3 14h7v7H3z"></path></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default function ServicemanDashboard() {
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
  }, [activeTab]);

  useEffect(() => {
    if (message) setMessage("");
  }, [activeTab]);

  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000); 
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
          paymentStatus: order.payment_status
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
    setActiveServiceTab(firstServiceKey || '');
  }, [activeTab, activeItemsByService, pastItemsByService]);

  const handleAddOrder = async () => {
    if (!customerUsername) return setMessage("Please select a customer.");
    if (!users.find(u => u.username === customerUsername && u.role === "customer")) return setMessage("Please select a valid customer from the suggestions.");
    const servicesToOrder = Object.entries(serviceQuantities).filter(([_, quantity]) => quantity > 0).map(([serviceKey, quantity]) => ({ service_name: serviceKey, quantity: Number(quantity) }));
    if (servicesToOrder.length === 0) return setMessage("Please add at least one service with a quantity greater than 0.");
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
        
        if (qrScannerMode === 'view_single_order' && scannedData?.type === 'order') {
            const { data } = await getOrderByQr(scannedData.data.id);
            setScannedData({ type: 'order', data });
        }
        
        if ((qrScannerMode === 'user_actions' || qrScannerMode === 'view_active_orders') && customerForQrOrder) {
            const { data } = await getActiveOrdersForUser(customerForQrOrder.id);
            setCustomerActiveOrdersForQr(data);
        }
        
        if (selectedCustomerForView) {
            fetchOrders();
        }

        fetchOrders(); 
    } catch (err) { 
        const errorMessage = err.response?.data?.detail || err.message || "A client-side error occurred.";
        setMessage(`Failed to update status: ${errorMessage}`);
        console.error("Failed to update status:", err); 
    } 
  };

  const handleLogout = () => { 
      localStorage.clear(); 
      window.location.href = '/'; 
  };
  
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    if (!currentPassword || !newPassword) {
      setMessage("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setMessage("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f39c12", started: "#3498db", washing: "#8e44ad", 
      folding: "#e67e22", ironing: "#e67e22", pressing: "#e67e22",
      steaming: "#e67e22", finishing: "#e67e22", inspection: "#3498db", 
      pre_treatment: "#3498db", tagging: "#3498db", quality_check: "#3498db",
      ready_for_pickup: "#27ae60", picked_up: "#95a5a6"
    };
    return colors[status] || "#7f8c8d";
  };
  
  const getPlanColor = (plan) => ({ none: "#95a5a6", standard: "#48C9B0", premium: "#9B59B6" })[plan] || "#7f8c8d";
  const getPlanLabel = (plan) => ({ none: "None", standard: "Standard", premium: "Premium" })[plan] || plan;
 
  const calculateTotalCost = () => {
    return Object.entries(serviceQuantities).reduce((total, [serviceKey, quantity]) => {
      return total + (SERVICE_PRICES[serviceKey]?.price || 0) * Number(quantity);
    }, 0);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
            {activeTab === 'manage-customers' && selectedCustomerForView 
              ? `Customer Insight: ${selectedCustomerForView.username}` 
              : currentTab.label
            }
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
                        <button 
                            key={serviceKey} 
                            className={`sub-tab-item ${activeServiceTab === serviceKey ? 'active' : ''}`}
                            onClick={() => setActiveServiceTab(serviceKey)}
                        >
                            {SERVICE_LABELS[serviceKey]}
                            <span className="item-count-badge">{currentItemsByService[serviceKey].length}</span>
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
                                            <div className="item-col col-qty">
                                                <div className="qty-val">Qty: {item.quantity}</div>
                                                <div className="cost-val">₹{item.cost}</div>
                                            </div>
                                            <div className="item-col col-pay">
                                                <span className={`payment-badge ${item.paymentStatus.toLowerCase()}`}>{item.paymentStatus.toUpperCase()}</span>
                                            </div>
                                            <div className="item-col col-stat">
                                                <span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>{item.status.replace(/_/g, " ")}</span>
                                            </div>
                                            {activeTab === 'active-orders' && (
                                                <div className="item-col col-act">
                                                    <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="status-select">
                                                        {workflow.map((status, statusIndex) => (
                                                            <option 
                                                                key={status} 
                                                                value={status} 
                                                                disabled={statusIndex < currentIndex || (status === 'picked_up' && item.paymentStatus.toLowerCase() === 'unpaid')}>
                                                                {status.replace(/_/g, " ")}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="no-data">No items for this service.</div>
                    )}
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
                          return (
                            <tr key={user.id} onClick={() => setSelectedCustomerForView(user)} className="clickable-row">
                              <td><div className="order-name">{user.username}</div><div className="order-id">ID: {user.id.substring(0, 8)}...</div></td>
                              <td>{user.email}</td>
                              <td><span className="status-badge" style={{backgroundColor: getPlanColor(user.membership_plan), borderRadius: '6px'}}>{getPlanLabel(user.membership_plan)}</span>{user.membership_plan !== 'none' && user.membership_expiry_date && <div className="plan-expiry">Expires: {new Date(user.membership_expiry_date).toLocaleDateString()}</div>}{user.membership_plan !== 'none' && <div className="services-used">Used: {user.services_used_this_month}/4 this month</div>}</td>
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
                    <button onClick={() => setSelectedCustomerForView(null)} className="btn-secondary">← Back to Customer List</button>
                    <button onClick={() => {
                      setCustomerUsername(selectedCustomerForView.username);
                      setActiveTab('add-order');
                    }} className="btn-primary">Create New Order for this Customer</button>
                  </div>
                  <div className="card">
                    <h3 className="card-title">Active Orders</h3>
                    <div className="order-items-detail">
                      {orders.filter(o => o.owner_id === selectedCustomerForView.id && isOrderActive(o)).flatMap(order => order.items.filter(item => item.status !== 'picked_up').map(item => (
                        <div key={item.id} className="item-detail-card">
                          <div className="item-header">
                            <div>
                                <span className="item-service">{SERVICE_LABELS[item.service_name]} (Qty: {item.quantity})</span>
                                <div className="order-id" style={{fontSize: '0.8rem', color: '#6c757d'}}>From Order #{order.id.substring(0,8)}</div>
                            </div>
                            <span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>{item.status.replace("_", " ").toUpperCase()}</span>
                          </div>
                          <div className="item-controls">
                            <label>Update Status:</label>
                            <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="status-select">
                              {SERVICE_WORKFLOWS[item.service_name]?.map((status, statusIndex) => {
                                const currentIndex = SERVICE_WORKFLOWS[item.service_name].indexOf(item.status);
                                return ( <option key={status} value={status} disabled={statusIndex < currentIndex || (status === 'picked_up' && order.payment_status.toLowerCase() === 'unpaid')}>{status.replace(/_/g, " ")}</option> );
                              })}
                            </select>
                          </div>
                        </div>
                      )))}
                      {orders.filter(o => o.owner_id === selectedCustomerForView.id && isOrderActive(o)).length === 0 && <p className="no-data">No active orders for this customer.</p>}
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="card-title">Past Orders</h3>
                    <div className="table-container">
                      <table className="data-table">
                        <thead><tr><th>Order ID</th><th>Date</th><th>Services</th><th>Cost</th></tr></thead>
                        <tbody>
                          {orders.filter(o => o.owner_id === selectedCustomerForView.id && !isOrderActive(o)).map(order => (
                            <tr key={order.id}>
                              <td><div className="order-id">#{order.id.substring(0, 8)}...</div></td>
                              <td>{formatDate(order.created_at)}</td>
                              <td>{order.items.map(i => SERVICE_LABELS[i.service_name] || i.service_name).join(', ')}</td>
                              <td>₹{order.total_cost.toFixed(2)}</td>
                            </tr>
                          ))}
                          {orders.filter(o => o.owner_id === selectedCustomerForView.id && !isOrderActive(o)).length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No past orders for this customer.</td></tr>}
                        </tbody>
                      </table>
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
                                <div className="suggestion-meta">Plan: {getPlanLabel(user.membership_plan)}{user.membership_plan !== 'none' && ` | Used: ${user.services_used_this_month}/4`}</div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                    {selectedCustomer && selectedCustomer.membership_plan !== 'none' && (
                        <div className="plan-info-box">
                            <strong>{selectedCustomer.username}</strong> is on the <strong>{getPlanLabel(selectedCustomer.membership_plan)}</strong> plan.
                            <div>They have used <strong>{selectedCustomer.services_used_this_month}/4</strong> services this month. The next {Math.max(0, 4 - selectedCustomer.services_used_this_month)} items may be covered by the plan.</div>
                        </div>
                    )}
                  </div>
                  <div>
                    {selectedCustomerActiveOrders.length > 0 && (
                        <div className="customer-active-orders-panel">
                            <h4>{selectedCustomer.username}'s Active Orders</h4>
                            <div className="table-container-mini">
                                <table className="data-table-mini">
                                    <thead>
                                        <tr>
                                            <th>SL</th>
                                            <th>Order ID</th>
                                            <th>Service</th>
                                            <th>Qty</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedCustomerActiveOrders.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td>{idx + 1}</td>
                                                <td>{item.orderId.substring(0, 8)}...</td>
                                                <td>{SERVICE_LABELS[item.service_name]}</td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                    <span className="status-badge-mini" style={{backgroundColor: getStatusColor(item.status)}}>
                                                        {item.status.replace(/_/g, ' ')}
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
                </div>

                <div style={{marginTop: '25px'}}>
                    <label>Select Services and Quantity:</label>
                    <div className="services-quantity-list">
                      {Object.entries(SERVICE_PRICES).map(([serviceKey, serviceInfo]) => {
                        const isDisabled = customerActiveServices.includes(serviceKey);
                        const quantity = serviceQuantities[serviceKey] || 0;
                        return (
                          <div key={serviceKey} className={`service-quantity-item ${isDisabled ? 'disabled' : ''}`}>
                            <div className="service-info">
                              <span className="service-name">{serviceInfo.name}</span>
                              <span className="service-price">₹{serviceInfo.price} / item</span>
                            </div>
                            {isDisabled ? (
                                <div className="service-disabled-msg">Already Active</div>
                            ) : (
                                <div className="quantity-control">
                                    <button onClick={() => setServiceQuantities(p => ({...p, [serviceKey]: Math.max(0, (p[serviceKey] || 0) - 1)}))}>-</button>
                                    <input type="number" min="0" max="20" value={quantity} onChange={(e) => { const val = Math.max(0, Math.min(20, Number(e.target.value))); setServiceQuantities(p => ({...p, [serviceKey]: val})); }}/>
                                    <button onClick={() => setServiceQuantities(p => ({...p, [serviceKey]: Math.min(20, (p[serviceKey] || 0) + 1)}))}>+</button>
                                </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                </div>

                {calculateTotalCost() > 0 && (
                  <div className="order-summary">
                    <h4>Order Summary</h4>
                    <div className="selected-services">
                      {Object.entries(serviceQuantities).filter(([_,q])=>q > 0).map(([key, q]) => {
                          const servicesUsed = selectedCustomer?.services_used_this_month || 0;
                          const isCovered = selectedCustomer?.membership_plan !== 'none' && (Object.keys(serviceQuantities).filter(k => serviceQuantities[k] > 0).indexOf(key) < (4 - servicesUsed));
                          return (
                            <div key={key} className="service-item">
                                <span>{SERVICE_LABELS[key]} x {q}</span>
                                <div>
                                {isCovered && <span className="plan-covered-tag">PLAN</span>}
                                <span>₹{SERVICE_PRICES[key].price * q}</span>
                                </div>
                            </div>
                          );
                      })}
                    </div>
                    <div className="total-cost"><strong>Total: ₹{calculateTotalCost()}</strong></div>
                  </div>
                )}
                <button onClick={handleAddOrder} disabled={loading || !customerUsername || calculateTotalCost() <= 0} className="btn-primary">{loading ? "Adding..." : "Add Order"}</button>
              </div>
            </div>
          )}

          {activeTab === "qr-scanner" && (
            <div className="tab-content">
              <div className="card">
                {qrScannerMode === 'scan' && (
                  <>
                    <h3 className="card-title">QR Operations</h3>
                    <p className="card-subtitle">Scan a customer's static QR or a specific order's QR code to begin.</p>
                    <div className="qr-input-container">
                      <div style={{flex: 1}}>
                        <label>QR Data or Order ID:</label>
                        <input type="text" placeholder="Scan or enter data..." value={qrScanInput} onChange={(e) => setQrScanInput(e.target.value)} autoFocus />
                      </div>
                      <button onClick={handleQrScan} disabled={loading || !qrScanInput.trim()} className="btn-primary">
                        {loading ? "Processing..." : "Process QR"}
                      </button>
                    </div>
                  </>
                )}

                {qrScannerMode === 'user_actions' && customerForQrOrder && (
                    <>
                        <h3 className="card-title">Customer: {customerForQrOrder.username}</h3>
                        <p className="card-subtitle">This customer has {customerActiveOrdersForQr.reduce((acc, order) => acc + order.items.filter(item => item.status !== 'picked_up').length, 0)} active service(s). Choose an action.</p>
                        <div className="qr-actions-choice">
                            <button className="btn-primary" onClick={() => setQrScannerMode('view_active_orders')}>View Active Orders</button>
                            <button className="btn-secondary" onClick={() => setQrScannerMode('create_order')}>Create New Order</button>
                            <button className="btn-secondary" onClick={resetQrScanner} style={{marginLeft: 'auto'}}>Cancel</button>
                        </div>
                    </>
                )}

                {qrScannerMode === 'view_active_orders' && customerForQrOrder && (
                    <>
                        <h3 className="card-title">Active Services for {customerForQrOrder.username}</h3>
                        {customerActiveOrdersForQr.length === 0 ? <p className="no-data">No active services found.</p> : (
                          <div className="order-items-detail">
                            {customerActiveOrdersForQr.flatMap(order => order.items.filter(item => item.status !== 'picked_up').map(item => (
                                <div key={item.id} className="item-detail-card">
                                  <div className="item-header">
                                    <div>
                                        <span className="item-service">{SERVICE_LABELS[item.service_name]} (Qty: {item.quantity})</span>
                                        <div className="order-id" style={{fontSize: '0.8rem', color: '#6c757d'}}>From Order #{order.id.substring(0,8)}</div>
                                    </div>
                                    <span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>{item.status.replace("_", " ").toUpperCase()}</span>
                                  </div>
                                  <div className="item-controls">
                                    <label>Update Status:</label>
                                    <select
                                      value={item.status}
                                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                      className="status-select"
                                    >
                                      {SERVICE_WORKFLOWS[item.service_name]?.map((status, statusIndex) => {
                                        const currentIndex = SERVICE_WORKFLOWS[item.service_name].indexOf(item.status);
                                        return (
                                          <option
                                            key={status}
                                            value={status}
                                            disabled={statusIndex < currentIndex || (status === 'picked_up' && order.payment_status.toLowerCase() === 'unpaid')}>
                                            {status.replace(/_/g, " ")}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                </div>
                            )))}
                          </div>
                        )}
                        <div className="qr-actions"><button onClick={resetQrScanner} className="btn-secondary">Back to Scanner</button></div>
                    </>
                )}

                {qrScannerMode === 'create_order' && customerForQrOrder && (
                  <>
                    <h3 className="card-title">New Order for {customerForQrOrder.username}</h3>
                    <div className="services-quantity-list">
                      {Object.entries(SERVICE_PRICES).map(([serviceKey, serviceInfo]) => {
                        const activeServiceNames = customerActiveOrdersForQr.flatMap(o => o.items.map(i => i.service_name));
                        const isDisabled = activeServiceNames.includes(serviceKey);
                        const quantity = qrServiceQuantities[serviceKey] || 0;
                        return (
                          <div key={serviceKey} className={`service-quantity-item ${isDisabled ? 'disabled' : ''}`}>
                            <div className="service-info">
                              <span className="service-name">{serviceInfo.name}</span>
                              <span className="service-price">₹{serviceInfo.price} / item</span>
                            </div>
                            {isDisabled ? (
                                <div className="service-disabled-msg">Already Active</div>
                            ) : (
                                <div className="quantity-control">
                                    <button onClick={() => setQrServiceQuantities(p => ({...p, [serviceKey]: Math.max(0, (p[serviceKey] || 0) - 1)}))}>-</button>
                                    <input type="number" min="0" max="20" value={quantity} onChange={(e) => { const val = Math.max(0, Math.min(20, Number(e.target.value))); setQrServiceQuantities(p => ({...p, [serviceKey]: val})); }}/>
                                    <button onClick={() => setQrServiceQuantities(p => ({...p, [serviceKey]: Math.min(20, (p[serviceKey] || 0) + 1)}))}>+</button>
                                </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="qr-actions">
                        <button onClick={handleCreateOrderFromQrFlow} className="btn-primary">Confirm & Create Order</button>
                        <button onClick={() => setQrScannerMode('user_actions')} className="btn-secondary">Back</button>
                    </div>
                  </>
                )}

                {qrScannerMode === 'view_single_order' && scannedData?.type === 'order' && (
                  <>
                    <h3 className="card-title">Order Details</h3>
                    <div className="scanned-order-details">
                      <div><strong>Order ID:</strong> <span className="order-id">{scannedData.data.id}</span></div>
                      <div><strong>Customer:</strong> {users.find(u => u.id === scannedData.data.owner_id)?.username || 'Unknown'}</div>
                      <div><strong>Total Cost:</strong> ₹{scannedData.data.total_cost.toFixed(2)} {scannedData.data.is_covered_by_plan && <span className="plan-covered-tag">PLAN</span>}</div>
                      <div><strong>Payment Status:</strong> <span className={`payment-badge ${scannedData.data.payment_status.toLowerCase()}`}>{scannedData.data.payment_status.toUpperCase()}</span></div>
                    </div>
                    
                    <h4 className="items-title">Service Items</h4>
                    <div className="order-items-detail">
                      {scannedData.data.items.map(item => {
                        const workflow = SERVICE_WORKFLOWS[item.service_name] || [];
                        const currentIndex = workflow.indexOf(item.status);
                        return(
                        <div key={item.id} className="item-detail-card">
                          <div className="item-header">
                            <span className="item-service">{SERVICE_LABELS[item.service_name]} (Qty: {item.quantity})</span>
                            <span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>{item.status.replace("_", " ").toUpperCase()}</span>
                          </div>
                          <div className="item-controls">
                            <label>Update Status:</label>
                            <select 
                              value={item.status} 
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className="status-select"
                            >
                                {workflow.map((status, statusIndex) => (
                                  <option 
                                    key={status} 
                                    value={status} 
                                    disabled={statusIndex < currentIndex || (status === 'picked_up' && scannedData.data.payment_status.toLowerCase() === 'unpaid')}>
                                    {status.replace(/_/g, " ")}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      )})}
                    </div>
                    
                    <div className="qr-actions">
                        <button onClick={resetQrScanner} className="btn-secondary">Scan Another</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && ( 
            <div className="tab-content">
              <div className="card">
                <h3 className="card-title">Change Password</h3>
                <form onSubmit={handleChangePasswordSubmit}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter your current password" required />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter a new password" required />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm the new password" required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        :root {
            --sidebar-bg: #2A2F45;
            --primary-accent: #48C9B0;
            --primary-accent-dark: #40B39E;
            --primary-accent-light: #e8f8f5;
            --text-dark: #2A2F45;
            --text-light: #556270;
            --border-color: #dee2e6;
            --background-light: #f4f7f9;
            --card-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        body { margin: 0; font-family: 'Inter', sans-serif; background-color: var(--background-light); }
        * { box-sizing: border-box; }
      `}</style>
      <style jsx>{`
        .app-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
        .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 65px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid var(--border-color); z-index: 1000; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
        .user-section { display: flex; align-items: center; gap: 15px; }
        .user-role { font-weight: 600; color: #343a40; background-color: #f1f3f5; padding: 6px 12px; border-radius: 6px; }
        .btn-logout { padding: 8px 15px; background-color: #f8f9fa; color: #e74c3c; border: 1px solid var(--border-color); border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-logout:hover { background-color: #e74c3c; color: #fff; border-color: #e74c3c; }
        .dashboard-layout { display: flex; height: 100%; padding-top: 65px; }
        .sidebar { width: 260px; background-color: var(--sidebar-bg); color: #fff; padding: 10px; transition: width 0.3s ease-in-out; overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column; }
        .content-area { flex-grow: 1; padding: 30px; overflow-y: auto; }
        .dashboard-layout.collapsed .sidebar { width: 70px; }
        .sidebar-header { display: flex; justify-content: flex-end; padding: 5px; height: 44px; margin-bottom: 15px; align-items: center; }
        .dashboard-layout.collapsed .sidebar-header { justify-content: center; }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #556270; transition: .4s; border-radius: 28px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary-accent); }
        input:checked + .slider:before { transform: translateX(22px); }
        .sidebar-nav { list-style: none; padding: 0; margin: 0; }
        .sidebar-nav button { display: flex; align-items: center; gap: 15px; width: 100%; padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; background: transparent; border: none; color: rgba(255, 255, 255, 0.7); font-size: 1rem; font-weight: 500; cursor: pointer; text-align: left; transition: background-color 0.2s ease, color 0.2s ease; white-space: nowrap; }
        .sidebar-nav button:hover { background-color: rgba(255, 255, 255, 0.1); color: #fff; }
        .nav-icon-wrapper { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; transition: background-color 0.2s ease; }
        .nav-icon { min-width: 24px; height: 24px; }
        .sidebar-nav button.active { color: #fff; font-weight: 600; }
        .sidebar-nav button.active .nav-icon-wrapper { background-color: var(--primary-accent); }
        .dashboard-layout.collapsed .sidebar-nav button { display: grid; place-items: center; width: 100%; height: 50px; padding: 0; margin-bottom: 10px; }
        .dashboard-layout.collapsed .nav-label, .dashboard-layout.collapsed .nav-count { display: none; }
        .dashboard-layout.collapsed .sidebar-nav button.active .nav-icon-wrapper { background-color: var(--primary-accent); }
        .nav-count { margin-left: auto; background-color: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 2px 8px; font-size: 0.8rem; }
        button.active .nav-count { background-color: rgba(255, 255, 255, 0.2); }
        .content-title { margin: 0 0 30px 0; font-size: 2rem; color: var(--text-dark); }
        .tab-content { display: flex; flex-direction: column; gap: 25px; }
        .card { background-color: #fff; border-radius: 12px; padding: 25px; box-shadow: var(--card-shadow); }
        .card-subtitle { font-size: 1rem; color: var(--text-light); margin-top: -15px; margin-bottom: 20px; }
        .orders-card { padding: 0; }
        .card-title { margin: 0 0 20px 0; font-size: 1.25rem; color: var(--text-dark); }
        .btn-primary { padding: 12px 25px; background-color: var(--primary-accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); background-color: var(--primary-accent-dark); box-shadow: 0 10px 20px -5px rgba(72, 201, 176, 0.4); }
        .btn-primary:disabled { background: #bdc3c7; cursor: not-allowed; }
        .btn-secondary { padding: 12px 25px; background-color: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.2s ease; }
        .btn-secondary:hover { background-color: #7f8c8d; }
        .grid { display: grid; gap: 20px; margin-bottom: 25px; }
        .two-cols { grid-template-columns: 1fr 1fr; }
        .three-cols { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: var(--text-light); }
        input, select { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; font-family: 'Inter', sans-serif; transition: all 0.2s ease-in-out; }
        input:focus, select:focus { outline: none; border-color: var(--primary-accent); box-shadow: 0 0 0 3px rgba(72, 201, 176, 0.2); }
        .message { padding: 12px 20px; margin-bottom: 20px; border-radius: 8px; border: 1px solid; display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .message.success { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
        .message.error { background-color: #fee2e2; color: #991b1b; border-color: #fecaca; }
        .message button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }
        .no-data { text-align: center; padding: 40px; color: var(--text-light); }
        .form-group { margin-bottom: 20px; }
        .autocomplete-container { position: relative; }
        .suggestions-box { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 100; max-height: 200px; overflow-y: auto; }
        .suggestion-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #f1f3f5; }
        .suggestion-item:hover { background-color: #f8f9fa; }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-meta { font-size: 0.8rem; color: var(--text-light); margin-top: 4px; }
        .plan-info-box { background-color: var(--primary-accent-light); border: 1px solid #a3e4d7; color: #117864; padding: 15px; border-radius: 8px; font-size: 0.9rem; line-height: 1.5; }
        .services-quantity-list { display: flex; flex-direction: column; gap: 12px; }
        .service-quantity-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; transition: all 0.2s ease; }
        .service-quantity-item.disabled { background-color: #f1f3f5; color: #adb5bd; }
        .service-info .service-name { font-weight: 600; color: var(--text-dark); }
        .service-info .service-price { font-size: 0.8rem; color: var(--text-light); display: block; }
        .service-disabled-msg { font-weight: bold; color: #f39c12; font-size: 0.9rem; }
        .quantity-control { display: flex; align-items: center; gap: 8px; }
        .quantity-control button { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ccc; background-color: #fff; font-size: 1.2rem; cursor: pointer; line-height: 1; }
        .quantity-control input { width: 50px; text-align: center; border-radius: 6px; padding: 6px; font-size: 1rem; -moz-appearance: textfield; }
        .quantity-control input::-webkit-outer-spin-button, .quantity-control input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .order-summary { margin-top: 25px; margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; }
        .order-summary h4 { margin: 0 0 15px 0; color: #333; }
        .selected-services { margin-bottom: 15px; }
        .service-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 1rem; }
        .service-item span:first-child { color: #495057; }
        .service-item > div { display: flex; align-items: center; gap: 8px; }
        .service-item span:last-child { font-weight: 600; color: #212529; }
        .plan-covered-tag { background-color: #27ae60; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
        .total-cost { border-top: 2px solid var(--border-color); padding-top: 15px; font-size: 1.2rem; text-align: right; }
        .customer-active-orders-panel { background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef; }
        .customer-active-orders-panel h4 { margin: 0 0 15px 0; color: #495057; font-size: 1rem; font-weight: 600; }
        .table-container-mini { overflow-x: auto; }
        .data-table-mini { width: 100%; border-collapse: collapse; }
        .data-table-mini th, .data-table-mini td { padding: 10px; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
        .data-table-mini th { font-weight: 600; color: #495057; }
        .data-table-mini tbody tr:last-child td { border-bottom: none; }
        .status-badge-mini { padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; color: white; display: inline-block; text-transform: capitalize; }
        .sub-tab-nav { display: flex; border-bottom: 2px solid #e9ecef; margin-bottom: 20px; padding: 0 25px;}
        .sub-tab-item {
            padding: 10px 16px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--text-light);
            margin-right: 10px;
            margin-bottom: -2px; 
            border-bottom: 3px solid transparent;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .sub-tab-item:hover { color: var(--text-dark); }
        .sub-tab-item.active {
            color: var(--primary-accent);
            font-weight: 600;
            border-bottom-color: var(--primary-accent);
        }
        .item-count-badge { background-color: #e9ecef; color: var(--text-light); padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: 700; transition: all 0.2s ease;}
        .sub-tab-item.active .item-count-badge { background-color: var(--primary-accent-light); color: var(--primary-accent-dark); }
        .sub-tab-content { padding: 0 25px 25px; }
        .item-list-header-wrapper { overflow-x: auto; }
        .item-list-content { overflow-x: auto; }
        .item-list-header, .item-row-card { display: flex; align-items: center; min-width: 800px; }
        .item-list-header { padding: 15px 10px; color: var(--text-light); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border-color); }
        .item-row-card { padding: 15px 10px; border-bottom: 1px solid #f1f3f5; transition: background-color 0.2s ease; }
        .item-row-card:last-child { border-bottom: none; }
        .item-row-card:hover { background-color: #f8f9fa; }
        .item-col { display: flex; flex-direction: column; justify-content: center; font-size: 0.95rem; color: var(--text-dark); padding: 0 10px; }
        .col-sl { flex: 0 0 40px; text-align: center; color: var(--text-light); font-weight: 700; }
        .col-cust { flex: 1 1 150px; font-weight: 600; }
        .col-date { flex: 1 1 120px; color: var(--text-light); }
        .col-qty { flex: 1 1 100px; }
        .qty-val { font-weight: 500; }
        .cost-val { font-size: 0.8rem; color: var(--text-light); }
        .col-pay { flex: 1 1 100px; text-align: center; }
        .col-stat { flex: 1 1 120px; text-align: center; }
        .col-act { flex: 1 1 150px; }
        .payment-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; color: white; display: inline-block; text-transform: uppercase; }
        .payment-badge.unpaid { background-color: #e74c3c; }
        .payment-badge.paid { background-color: #27ae60; }
        .status-badge { padding: 5px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; color: white; display: inline-block; text-transform: capitalize; }
        .status-select { font-size: 0.9rem; padding: 8px 10px; border-radius: 6px; border: 1px solid #ccc; width: 100%; text-transform: capitalize; }
        .status-select option:disabled { color: #ccc; }
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 16px 15px; text-align: left; border-bottom: 1px solid #f1f3f5; vertical-align: middle; }
        .data-table th { background-color: #f8f9fa; font-weight: 700; color: var(--text-dark); }
        .data-table tbody tr:hover { background-color: var(--primary-accent-light); }
        .order-name { font-weight: 700; font-size: 1.05rem; color: var(--text-dark); }
        .order-id { font-size: 0.8rem; color: var(--text-light); margin-top: 2px; }
        .plan-expiry, .services-used { font-size: 0.8rem; color: var(--text-light); margin-top: 4px; }
        .qr-input-container { display: flex; gap: 15px; align-items: flex-end; }
        .order-items-detail { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
        .item-detail-card { background-color: #f8f9fa; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef; }
        .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .item-service { font-weight: 600; font-size: 1.1rem; }
        .item-controls { display: flex; align-items: center; gap: 10px; }
        .qr-actions { margin-top: 25px; }
        .scanned-order-details { display: grid; grid-template-columns: auto 1fr; gap: 10px 20px; align-items: center; margin-bottom: 20px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
        .scanned-order-details > div { font-size: 1rem; }
        .scanned-order-details > div > strong { color: var(--text-light); font-weight: 600; }
        .items-title { font-size: 1.1rem; color: var(--text-dark); margin-top: 25px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); }
        .qr-actions-choice {
          display: flex;
          gap: 15px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .clickable-row:hover {
          background-color: var(--primary-accent-light) !important;
        }
        .customer-insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: -10px;
        }
      `}</style>
    </div>
  );
}