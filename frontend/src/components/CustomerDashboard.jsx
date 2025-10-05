import React, { useEffect, useState, useMemo } from "react";
import {
  getOrders,
  changePassword,
  getAccountDetails,
  purchaseSubscription,
  SERVICE_PRICES,
  getMyStaticQRCodes,
  SERVICE_WORKFLOWS
} from "../api";

const WashWiseLogo = ({ small }) => ( <svg width={small ? "40" : "80"} height={small ? "40" : "80"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logo-gradient)" strokeWidth="1.5"/><path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 10.1642 8.21203 8.6132 9.875 7.82883" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/><defs><linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#81ECEC"/><stop offset="1" stopColor="#74B9FF"/></linearGradient></defs></svg>);
const IconOrders = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const IconHistory = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconAccount = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconCheck = () => <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>;
const IconCross = () => <svg className="icon-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconMail = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconShield = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

const PaymentModal = ({ isOpen, onClose, planDetails, onConfirmPayment }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  if (!isOpen) return null;
  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmPayment(planDetails.name);
      setIsProcessing(false);
      onClose();
    }, 2000);
  };
  return (
    <div className="modal-backdrop payment-modal-backdrop">
      <div className="modal-content payment-modal-content">
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>×</button>
        <h3>Complete Your Purchase</h3>
        <div className="plan-summary">
          <span>You are purchasing the</span>
          <strong>{planDetails.label} Plan</strong>
          <div className="plan-price-summary">₹{planDetails.price}/year</div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
          <div className="form-group">
            <label>Card Number</label>
            <input type="text" placeholder="**** **** **** 1234" disabled={isProcessing} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="text" placeholder="MM / YY" disabled={isProcessing} required />
            </div>
            <div className="form-group">
              <label>CVC</label>
              <input type="text" placeholder="123" disabled={isProcessing} required />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-pay" disabled={isProcessing}>
            {isProcessing ? <div className="mini-spinner"></div> : Pay ₹${planDetails.price}}
          </button>
        </form>
      </div>
    </div>
  );
};

const ImageModal = ({ src, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>×</button>
      <img src={src} alt="Enlarged QR Code" className="modal-image" />
    </div>
  </div>
);

export default function CustomerDashboard({ onLogout }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("my-orders");
  const [orders, setOrders] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [planToPurchase, setPlanToPurchase] = useState(null);
  const [myQrCodes, setMyQrCodes] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [{ data: ordersData }, { data: accountData }, { data: qrCodesData }] = await Promise.all([
        getOrders(),
        getAccountDetails(),
        getMyStaticQRCodes()
      ]);
      setOrders(ordersData);
      setAccountInfo(accountData);
      setMyQrCodes(qrCodesData);
    } catch (err) {
      setMessage("Failed to load your data. Please try refreshing.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (message) setMessage("");
  }, [activeTab]);

  // Effect to make the message disappear after 3 seconds.
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000); 
      return () => clearTimeout(timer); 
    }
  }, [message]);

  const activateSubscription = async (planName) => {
    setLoading(true);
    try {
        await purchaseSubscription(planName);
        setMessage("Subscription updated successfully!");
        await fetchData();
    } catch (error) {
        setMessage(Error: ${error.response?.data?.detail || error.message});
    } finally {
        setLoading(false);
    }
  };

  const handleOpenPaymentModal = (plan) => {
    const planDetails = {
      name: plan,
      label: plan === 'standard' ? 'Standard' : 'Premium',
      price: plan === 'standard' ? '5,000' : '10,000'
    };
    setPlanToPurchase(planDetails);
    setPaymentModalOpen(true);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword !== confirmPassword) return setMessage("New passwords do not match.");
    if (!currentPassword || !newPassword) return setMessage("Please fill in all fields.");
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setMessage("Password updated successfully!");
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      setMessage(Error: ${error.response?.data?.detail || error.message});
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (src) => {
    setModalImageSrc(${API_URL}${src});
    setIsModalOpen(true);
  };
  
  const getStatusColor = (status) => ({ pending: "#ffc107", started: "#17a2b8", washing: "#6f42c1", washed: "#6f42c1", folding: "#fd7e14", ironing: "#fd7e14", pressing: "#fd7e14", steaming: "#fd7e14", finishing: "#fd7e14", inspection: "#17a2b8", pre_treatment: "#17a2b8", tagging: "#17a2b8", dry_cleaning: "#6f42c1", drying: "#e83e8c", quality_check: "#17a2b8", ready_for_pickup: "#28a745", picked_up: "#6c757d" })[status] || "#6c757d";
  const getPlanColor = (plan) => ({ none: "#6c757d", standard: "#48C9B0", premium: "#9B59B6" })[plan] || "#6c757d";
  const getPlanLabel = (plan) => ({ none: "No Plan", standard: "Standard", premium: "Premium" })[plan] || plan;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return ${day}/${month}/${year};
  };

  const calculateProgress = (serviceName, currentStatus) => {
    const workflow = SERVICE_WORKFLOWS[serviceName];
    if (!workflow) return 0;
    const currentIndex = workflow.indexOf(currentStatus);
    if (currentIndex === -1) return 0;
    const totalSteps = workflow.length - 1;
    if (totalSteps <= 0) return 100;
    return (currentIndex / totalSteps) * 100;
  };

  const activeOrders = useMemo(() => orders.filter(order => !order.items.every(item => item.status === 'picked_up')), [orders]);
  const completedOrders = useMemo(() => orders.filter(order => order.items.every(item => item.status === 'picked_up')), [orders]);
  
  const flattenedActiveOrderItems = useMemo(() => 
    activeOrders.flatMap(order => 
      order.items.map(item => ({
        ...item,
        orderId: order.id,
        orderCreatedAt: order.created_at,
        isCoveredByPlan: order.is_covered_by_plan,
        paymentStatus: order.payment_status,
        orderQrCodeUrl: order.qr_code_url,
      }))
    ), [activeOrders]);

  const TABS = [
    { id: "my-orders", label: "My Orders", icon: <IconOrders />, count: flattenedActiveOrderItems.length },
    { id: "order-history", label: "Order History", icon: <IconHistory /> },
    { id: "my-account", label: "My Account", icon: <IconAccount /> },
    { id: "settings", label: "Settings", icon: <IconSettings /> },
  ];

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];
  
  if (loading && !accountInfo) {
    return (
      <div className="loading-container"><div className="spinner"></div><p>Loading your dashboard...</p></div>
    );
  }

  return (
    <div className="app-container">
      {isModalOpen && <ImageModal src={modalImageSrc} onClose={() => setIsModalOpen(false)} />}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        planDetails={planToPurchase}
        onConfirmPayment={activateSubscription}
      />
      
      <header className="top-bar">
        <div className="logo-section"><WashWiseLogo small /><span className="brand-name">WashWise</span></div>
        <div className="user-section"><span className="user-role customer">Customer</span><button className="btn-logout" onClick={onLogout}>Logout</button></div>
      </header>
      <div className={dashboard-layout ${isSidebarCollapsed ? 'collapsed' : ''}}>
        <nav className="sidebar">
          <div className="sidebar-header"><label className="toggle-switch"><input type="checkbox" checked={!isSidebarCollapsed} onChange={() => setSidebarCollapsed(!isSidebarCollapsed)} /><span className="slider round"></span></label></div>
          <ul className="sidebar-nav">
            {TABS.map(tab => (<li key={tab.id}><button onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "active" : ""}><span className="nav-icon-wrapper"><span className="nav-icon">{tab.icon}</span></span><span className="nav-label">{tab.label}</span>{tab.id === 'my-orders' && tab.count > 0 && <span className="nav-count">{tab.count}</span>}</button></li>))}
          </ul>
        </nav>
        <main className="content-area">
          <h2 className="content-title">{currentTab.label}</h2>
          {message && (<div className={message ${message.includes("successfully") ? 'success' : 'error'}}><span>{message}</span><button onClick={() => setMessage("")}>×</button></div>)}
          
          {activeTab === "my-orders" && ( 
            <div className="tab-content">
              {flattenedActiveOrderItems.length === 0 ? (<div className="card no-data-card"><h3>No Active Services</h3><p>You currently don't have any active services.</p></div>) : (
                <div className="orders-grid">
                  {flattenedActiveOrderItems.map((item) => {
                    const progress = calculateProgress(item.service_name, item.status);
                    return (
                    <div className="card order-card" key={item.id}>
                      <div className="card-header"><div><h3>{SERVICE_PRICES[item.service_name]?.name || item.service_name}</h3><p className="order-date">From Order #{item.orderId.substring(0, 8)} &bull; {formatDate(item.orderCreatedAt)}</p></div><span className="status-badge item-status" style={{backgroundColor: getStatusColor(item.status)}}>{item.status.replace(/_/g, ' ').toUpperCase()}</span></div>
                      <div className="card-body">
                        <div className="items-list-container">
                            <div className="order-item-row" key={item.id}>
                                <div className="item-main-info"><div className="item-details"><span className="item-quantity">{item.quantity}x</span><span className="item-name">{SERVICE_PRICES[item.service_name]?.name || item.service_name}</span></div>
                                <div className="cost-info-inline"><strong>₹{item.cost.toFixed(2)}</strong>{item.cost === 0 && item.isCoveredByPlan && <span className="plan-covered-tag">PLAN</span>}</div>
                                </div>
                                <div className="item-progress-container"><div className="progress-bar item-progress-bar"><div className="progress-bar-inner item-progress-bar-inner" style={{ width: ${progress}% }}></div></div></div>
                            </div>
                        </div>
                      </div>
                      {item.orderQrCodeUrl && (
                        <div className="card-footer">
                          <p>Track this specific order with its QR Code</p>
                          <div className="qr-code-box">
                            <img src={${API_URL}${item.orderQrCodeUrl}} alt="Order-Specific QR Code" className="qr-image" onClick={() => handleImageClick(item.orderQrCodeUrl)}/>
                          </div>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {activeTab === "order-history" && ( 
            <div className="tab-content">
              <div className="card">
                {completedOrders.length === 0 ? (<div className="no-data-card small"><h3>No Completed Orders Yet</h3><p>Your past orders will appear here.</p></div>) : (
                  <div className="table-container"><table className="data-table"><thead><tr><th>Order ID</th><th>Date</th><th>Services</th><th>Cost</th><th>Payment</th><th>Status</th></tr></thead><tbody>{completedOrders.map(order => (<tr key={order.id}><td><div className="order-name">#{order.id.substring(0, 8)}</div><div className="order-id">{order.id.substring(8, 16)}...</div></td><td className="text-center">{formatDate(order.created_at)}</td><td>{order.items.map(i => SERVICE_PRICES[i.service_name]?.name || i.service_name).join(', ')}</td><td className="text-center">₹{order.total_cost.toFixed(2)}{order.is_covered_by_plan && <div className="plan-covered-small">Plan</div>}</td><td><span className={payment-badge ${order.payment_status}}>{order.payment_status.toUpperCase()}</span></td><td><span className="status-badge" style={{backgroundColor: getStatusColor('picked_up')}}>COMPLETED</span></td></tr>))}</tbody></table></div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === "my-account" && (
            <div className="tab-content">
              {!accountInfo ? (<div className="card"><p>Loading account details...</p></div>) : (
                <>
                    <div className="account-grid">
                        <div className="card profile-details-card">
                            <h3 className="card-title">Profile Details</h3>
                            <div className="detail-item"><div className="detail-icon"><IconAccount/></div><div className="detail-text"><span className="detail-label">Username</span><span className="detail-value">{accountInfo.username}</span></div></div>
                            <div className="detail-item"><div className="detail-icon"><IconMail/></div><div className="detail-text"><span className="detail-label">Email</span><span className="detail-value">{accountInfo.email}</span></div></div>
                            <div className="detail-item"><div className="detail-icon"><IconShield/></div><div className="detail-text"><span className="detail-label">Role</span><span className="detail-value role-tag">{accountInfo.role}</span></div></div>
                        </div>
                        <div className="card">
                            <h3 className="card-title">Your Static QR Code</h3>
                            <p className="card-subtitle">Present this to a serviceman to start new orders.</p>
                            {myQrCodes && myQrCodes.user_qr ? (
                                <div className="static-qr-container">
                                    <img 
                                        src={${API_URL}${myQrCodes.user_qr}} 
                                        alt="Your Static QR Code" 
                                        onClick={() => handleImageClick(myQrCodes.user_qr)}
                                    />
                                </div>
                            ) : (
                                <p>Loading your QR code...</p>
                            )}
                        </div>
                    </div>

                    <div className="card subscription-card" style={{'--plan-color': getPlanColor(accountInfo.membership_plan)}}>
                        <h3 className="card-title">Subscription Status</h3>
                        <div className="plan-badge">{getPlanLabel(accountInfo.membership_plan)} Plan</div>
                        {accountInfo.membership_plan !== 'none' ? (
                            <>
                                <p>Your plan is active and renews on <strong>{
                                    formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)))
                                }</strong>.</p>
                                <div className="usage-meter">
                                    <div className="usage-label"><span>Monthly Service Usage</span><strong>{accountInfo.services_used_this_month} / 4</strong></div>
                                    <div className="progress-bar plan-progress-bar"><div className="progress-bar-inner" style={{width: ${(accountInfo.services_used_this_month / 4) * 100}%}}></div></div>
                                </div>
                            </>
                        ) : (
                            <p>You are not subscribed to any plan. Choose a plan below for exclusive benefits!</p>
                        )}
                    </div>

                    <div className="card plans-section-card">
                        <h3 className="card-title">Upgrade Your Plan</h3>
                        <p className="card-subtitle">Unlock more benefits and enjoy premium services with our subscription plans.</p>
                        <div className="plans-container">
                            <div className={plan-card standard ${accountInfo.membership_plan === 'standard' ? 'active' : ''} ${accountInfo.membership_plan === 'premium' ? 'unavailable' : ''}}>
                                {accountInfo.membership_plan === 'standard' && <div className="current-plan-banner">Current Plan</div>}
                                <div className="plan-header">
                                    <h4>Standard Plan</h4>
                                    <p className="plan-price"><span>₹5,000</span>/year</p>
                                </div>
                                <div className="plan-body">
                                    <ul className="plan-features">
                                        <li className="plan-feature-item"><IconCheck /><span>4 services per month</span></li>
                                        <li className="plan-feature-item"><IconCheck /><span>Covers Wash & Fold</span></li>
                                        <li className="plan-feature-item"><IconCheck /><span>Covers Wash & Iron</span></li>
                                        <li className="plan-feature-item"><IconCross /><span>Does not cover premium services</span></li>
                                    </ul>
                                    <button 
                                        className="btn-primary btn-purchase" 
                                        onClick={() => handleOpenPaymentModal('standard')} 
                                        disabled={loading || accountInfo.membership_plan === 'standard' || accountInfo.membership_plan === 'premium'}>
                                        {
                                            accountInfo.membership_plan === 'standard' ? 'Plan Active'
                                            : accountInfo.membership_plan === 'premium' ? 'Cannot Downgrade'
                                            : 'Choose Standard'
                                        }
                                    </button>
                                </div>
                            </div>
                            <div className={plan-card premium ${accountInfo.membership_plan === 'premium' ? 'active' : ''}}>
                                {accountInfo.membership_plan === 'premium' && <div className="current-plan-banner">Current Plan</div>}
                                <div className="plan-header">
                                    <h4>Premium Plan</h4>
                                    <p className="plan-price"><span>₹10,000</span>/year</p>
                                </div>
                                <div className="plan-body">
                                    <ul className="plan-features">
                                        <li className="plan-feature-item"><IconCheck /><span>4 services per month</span></li>
                                        <li className="plan-feature-item"><IconCheck /><span>Covers Wash & Fold</span></li>
                                        <li className="plan-feature-item"><IconCheck /><span>Covers Wash & Iron</span></li>
                                        <li className="plan-feature-item"><IconCheck /><span>Covers ALL premium services</span></li>
                                    </ul>
                                    <button 
                                        className="btn-primary btn-purchase" 
                                        onClick={() => handleOpenPaymentModal('premium')} 
                                        disabled={loading || accountInfo.membership_plan === 'premium'}>
                                        {accountInfo.membership_plan === 'premium' ? 'Plan Active' : 'Upgrade to Premium'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
              )}
            </div>
          )}

          {activeTab === "settings" && ( 
            <div className="tab-content">
              <div className="card"><h3 className="card-title">Change Password</h3><form onSubmit={handleChangePasswordSubmit}><div className="form-group"><label>Current Password</label><input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div><div className="form-group"><label>New Password</label><input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div><div className="form-group"><label>Confirm New Password</label><input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div><button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button></form></div>
            </div>
          )}
        </main>
      </div>
      
      <style jsx="true" global="true">{@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap'); @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap'); body { margin: 0; font-family: 'Inter', sans-serif; background-color: #f4f7f9; } * { box-sizing: border-box; }}</style>
      <style jsx="true">{`
        :root {
            --primary-color: #48C9B0;
            --primary-dark: #40B39E;
            --primary-light: #e8f8f5;
            --premium-color: #9B59B6;
            --premium-dark: #8E44AD;
            --sidebar-bg: #2A2F45;
            --text-dark: #242c3d;
            --text-light: #6c757d;
            --border-color: #dee2e6;
        }
        .app-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
        .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 65px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; border-bottom: 1px solid var(--border-color); z-index: 1000; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
        .user-section { display: flex; align-items: center; gap: 15px; }
        .user-role { font-weight: 600; padding: 6px 12px; border-radius: 6px; }
        .user-role.customer { color: #155724; background-color: #d4edda; }
        .btn-logout { padding: 8px 15px; background-color: #f8f9fa; color: #dc3545; border: 1px solid var(--border-color); border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-logout:hover { background-color: #dc3545; color: #fff; border-color: #dc3545; }
        .dashboard-layout { display: flex; height: 100%; padding-top: 65px; }
        .sidebar { width: 260px; background-color: var(--sidebar-bg); color: #fff; padding: 10px; transition: width 0.3s ease-in-out; overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column; }
        .content-area { flex-grow: 1; padding: 30px; overflow-y: auto; }
        .dashboard-layout.collapsed .sidebar { width: 70px; }
        .sidebar-header { display: flex; justify-content: flex-end; padding: 5px; height: 44px; margin-bottom: 15px; align-items: center; }
        .dashboard-layout.collapsed .sidebar-header { justify-content: center; }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #556b8d; transition: .4s; border-radius: 28px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary-color); }
        input:checked + .slider:before { transform: translateX(22px); }
        .sidebar-nav { list-style: none; padding: 0; margin: 0; }
        .sidebar-nav button { display: flex; align-items: center; gap: 15px; width: 100%; padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; background: transparent; border: none; color: rgba(255, 255, 255, 0.7); font-size: 1rem; font-weight: 500; cursor: pointer; text-align: left; transition: background-color 0.2s ease, color 0.2s ease; white-space: nowrap; }
        .sidebar-nav button:hover { background-color: rgba(255, 255, 255, 0.1); color: #fff; }
        .nav-icon-wrapper { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; transition: background-color 0.2s ease; }
        .nav-icon { min-width: 24px; height: 24px; }
        .sidebar-nav button.active { color: #fff; font-weight: 600; }
        .sidebar-nav button.active .nav-icon-wrapper { background-color: var(--primary-color); }
        .dashboard-layout.collapsed .sidebar-nav button { display: grid; place-items: center; width: 100%; height: 50px; padding: 0; margin-bottom: 10px; }
        .dashboard-layout.collapsed .nav-label, .dashboard-layout.collapsed .nav-count { display: none; }
        .dashboard-layout.collapsed .sidebar-nav button.active .nav-icon-wrapper { background-color: var(--primary-color); }
        .nav-count { margin-left: auto; background-color: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 2px 8px; font-size: 0.8rem; }
        button.active .nav-count { background-color: rgba(255, 255, 255, 0.2); }
        .content-title { margin: 0 0 30px 0; font-size: 2rem; color: var(--text-dark); }
        .tab-content { display: flex; flex-direction: column; gap: 25px; }
        .card { background-color: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .card-title { margin: 0 0 20px 0; font-size: 1.25rem; color: var(--text-dark); }
        .card-subtitle { font-size: 1rem; color: var(--text-light); margin: -15px 0 25px 0; }
        .orders-grid { display: grid; gap: 25px; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); }
        .order-card { transition: all 0.3s ease; }
        .order-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .card-header h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #333; }
        .order-date { font-size: 0.85rem; color: #666; margin-top: 5px; }
        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; color: white; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; }
        .items-list-container { margin-bottom: 20px; }
        .order-item-row { display: flex; flex-direction: column; padding: 10px 5px; border-radius: 6px; }
        .item-main-info { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .item-details { display: flex; align-items: center; gap: 10px; }
        .item-quantity { font-weight: 700; color: var(--primary-color); font-size: 1rem; }
        .item-name { font-weight: 500; color: #333; }
        .item-status { font-size: 0.7rem; }
        .plan-covered-tag { background-color: #d4edda; color: #155724; padding: 2px 6px; font-size: 0.7rem; font-weight: bold; border-radius: 4px; }
        .cost-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
        .cost-info-inline { display: flex; align-items: center; gap: 8px; }
        .cost-item, .payment-status { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.95rem; }
        .cost-item:last-child, .payment-status:last-child { margin-bottom: 0; }
        .cost-item strong { font-size: 1.1rem; }
        .plan-covered { font-size: 0.7rem; color: #28a745; font-weight: bold; margin-left: 8px; background-color: #d4edda; padding: 2px 6px; border-radius: 4px; }
        .payment-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
        .payment-badge.paid { background-color: #28a745; color: white; }
        .payment-badge.unpaid { background-color: #dc3545; color: white; }
        .card-footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; }
        .card-footer p { font-size: 0.9rem; color: #666; margin: 0 0 12px 0; font-weight: 600; }
        .qr-code-box { display: inline-block; padding: 10px; background-color: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .qr-image { width: 100px; height: 100px; display: block; cursor: pointer; }
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.75); display: flex; justify-content: center; align-items: center; z-index: 2000; }
        .modal-content { position: relative; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); max-width: 500px; width: 90%; }
        .modal-close { position: absolute; top: 10px; right: 15px; font-size: 2rem; color: #555; background: none; border: none; cursor: pointer; line-height: 1; }
        .modal-image { display: block; width: 100%; height: auto; border-radius: 8px; }
        .no-data-card { text-align: center; padding: 60px 20px; }
        .no-data-card h3 { color: #666; } .no-data-card p { color: #999; }
        .btn-primary { padding: 12px 25px; background-color: var(--primary-color); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(72, 201, 176, 0.4); }
        .btn-primary:disabled { background: #adb5bd; cursor: not-allowed; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #333; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .message { padding: 12px 20px; margin-bottom: 20px; border-radius: 8px; border: 1px solid; display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .message.success { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
        .message.error { background-color: #fee2e2; color: #991b1b; border-color: #fecaca; }
        .message button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 16px 15px; text-align: left; border-bottom: 1px solid #eee; vertical-align: middle; }
        .data-table th { background-color: #f8f9fa; font-weight: 700; color: #34495e; }
        .order-name { font-weight: 700; }
        .plan-covered-small { font-size: 0.7rem; color: #28a745; font-weight: bold; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
        .progress-bar { width: 100%; height: 12px; background-color: #e9ecef; border-radius: 12px; overflow: hidden; }
        .progress-bar-inner { height: 100%; border-radius: 12px; transition: width 0.5s ease-in-out; }
        .plan-progress-bar .progress-bar-inner { background-color: var(--plan-color); }
        .item-progress-container { width: 100%; margin-top: 8px; }
        .item-progress-bar { height: 6px; }
        .item-progress-bar-inner { background-image: linear-gradient(45deg, var(--primary-color), #74b9ff); }
        .account-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; }
        .profile-details-card .detail-item { display: flex; align-items: center; gap: 20px; padding: 15px 0; border-bottom: 1px solid #f1f3f5; }
        .profile-details-card .detail-item:last-child { border-bottom: none; }
        .detail-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background-color: var(--primary-light); color: var(--primary-color); flex-shrink: 0; }
        .detail-icon svg { width: 22px; height: 22px; }
        .detail-text { display: flex; flex-direction: column; gap: 2px; }
        .detail-label { font-weight: 500; color: #666; font-size: 0.85rem; }
        .detail-value { font-weight: 600; color: #333; }
        .role-tag { text-transform: capitalize; background-color: var(--primary-light); color: var(--primary-color); padding: 4px 10px; border-radius: 6px; font-size: 0.9rem; align-self: flex-start; }
        .subscription-card { background-image: linear-gradient(135deg, #fff 70%, color-mix(in srgb, var(--plan-color) 20%, transparent)); }
        .subscription-card p { color: #666; line-height: 1.6; margin-top: 0; }
        .subscription-card p strong { color: var(--text-dark); }
        .plan-badge { display: inline-block; padding: 10px 20px; border-radius: 8px; font-size: 1.2rem; font-weight: 700; color: #fff; background-color: var(--plan-color); margin-bottom: 20px; }
        .usage-meter { margin-top: 25px; }
        .usage-label { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; color: #555; }
        .plans-section-card { background-color: #f8f9fa; border: 1px solid #e9ecef; }
        .plans-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }
        .plan-card { position: relative; border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; display: flex; flex-direction: column; background-color: #fff; }
        .plan-card:not(.unavailable):hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .plan-card.active { border-color: transparent; box-shadow: 0 0 0 3px var(--glow-color), 0 8px 25px rgba(0,0,0,0.1); }
        .plan-card.standard { --glow-color: var(--primary-color); }
        .plan-card.premium { --glow-color: var(--premium-color); }
        .plan-card.unavailable { opacity: 0.65; filter: grayscale(50%); cursor: not-allowed; }
        .current-plan-banner { position: absolute; top: 15px; right: -45px; background-color: var(--glow-color); color: white; padding: 6px 40px; transform: rotate(45deg); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 2; }
        .plan-header { padding: 25px; color: white; text-align: center; }
        .plan-card.standard .plan-header { background: linear-gradient(135deg, #48C9B0, #76D7C4); }
        .plan-card.premium .plan-header { background: linear-gradient(135deg, #9B59B6, #C39BD3); }
        .plan-header h4 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .plan-price { margin: 10px 0 0; font-size: 1rem; opacity: 0.9; }
        .plan-price span { font-size: 2.5rem; font-weight: 800; }
        .plan-body { padding: 25px; display: flex; flex-direction: column; flex-grow: 1; }
        .plan-features { list-style: none; padding: 0; margin: 0 0 25px 0; flex-grow: 1; }
        .plan-feature-item { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; color: #495057; font-size: 0.95rem; }
        .plan-feature-item svg { width: 20px; height: 20px; flex-shrink: 0; }
        :global(.icon-check) { stroke: #28a745; }
        :global(.icon-cross) { stroke: #dc3545; }
        .btn-purchase { width: 100%; }
        .plan-card.standard .btn-purchase { background-color: var(--primary-color); }
        .plan-card.standard .btn-purchase:hover:not(:disabled) { background-color: var(--primary-dark); box-shadow: 0 10px 20px -5px rgba(72, 201, 176, 0.4); }
        .plan-card.premium .btn-purchase { background-color: var(--premium-color); }
        .plan-card.premium .btn-purchase:hover:not(:disabled) { background-color: var(--premium-dark); box-shadow: 0 10px 20px -5px rgba(155, 89, 182, 0.4); }
        .payment-modal-backdrop { z-index: 2001; }
        .payment-modal-content { max-width: 420px; }
        .payment-modal-content h3 { text-align: center; margin-top: 0; margin-bottom: 20px; color: var(--text-dark); }
        .plan-summary { text-align: center; background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
        .plan-summary span { display: block; font-size: 0.9rem; color: var(--text-light); }
        .plan-summary strong { display: block; font-size: 1.3rem; margin: 5px 0; color: var(--text-dark); }
        .plan-price-summary { font-size: 1.1rem; font-weight: 600; color: var(--primary-color); }
        .form-row { display: flex; gap: 15px; }
        .form-row .form-group { flex: 1; }
        .btn-pay { width: 100%; margin-top: 10px; display: flex; justify-content: center; align-items: center; min-height: 48px; }
        .mini-spinner { width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .qr-codes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 25px;
            text-align: center;
        }
        .qr-code-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 15px;
            border-radius: 8px;
            background-color: #f8f9fa;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .qr-code-item:hover {
            transform: scale(1.05);
        }
        .qr-code-item h4 {
            margin: 0;
            font-size: 1rem;
            color: var(--text-dark);
        }
        .qr-code-item img {
            width: 100%;
            max-width: 150px;
            height: auto;
            border-radius: 4px;
        }
        .static-qr-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .static-qr-container img {
            max-width: 200px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            cursor: pointer;
        }
      `}</style>
    </div>
  );
}