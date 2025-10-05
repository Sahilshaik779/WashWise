import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// --- Axios Instance & Helper ---
const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Authentication -----------------
export const registerUser = (username, email, password, role) => {
  return axiosInstance.post('/register', { username, email, password, role });
};

export const loginUser = async (username, password) => {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  return res.data;
};

// --- Users and Account-----------------
export const getAllUsers = () => axiosInstance.get('/users');
export const getAccountDetails = () => axiosInstance.get('/users/me');
export const changePassword = (current_password, new_password) => {
  return axiosInstance.put('/users/me/password', { current_password, new_password });
};
export const purchaseSubscription = (plan) => {
  return axiosInstance.put('/users/me/subscribe', { plan });
};
export const getMyStaticQRCodes = () => {
  return axiosInstance.get('/users/me/qrcodes');
};
export const getActiveOrdersForUser = (userId) => {
  return axiosInstance.get(`/users/${userId}/active-orders`);
};
// --- Orders -----------------
export const createOrder = (orderData) => {
  return axiosInstance.post('/orders', orderData);
};
export const getOrders = () => axiosInstance.get('/orders');
export const getOrderByQr = (orderId) => axiosInstance.get(`/orders/qr/${orderId}`);
export const updateOrderItemStatus = (itemId, status) => {
  return axiosInstance.put(`/orders/items/${itemId}/status`, { status });
};

// --- Service Prices -----------------
export const SERVICE_PRICES = {
    "wash_and_fold": { name: "Wash and Fold", price: 10 },
    "wash_and_iron": { name: "Wash and Iron", price: 25 },
    "dry_cleaning": { name: "Dry Cleaning", price: 50 },
    "premium_wash": { name: "Premium Wash", price: 40 },
    "steam_iron": { name: "Steam Iron", price: 15 },
};

export const SERVICE_WORKFLOWS = {
    "wash_and_fold": ["pending", "started", "washing", "folding", "ready_for_pickup", "picked_up"],
    "wash_and_iron": ["pending", "started", "washing", "ironing", "ready_for_pickup", "picked_up"],
    "premium_wash": ["pending", "started", "inspection", "pre_treatment", "washing", "drying", "quality_check", "ready_for_pickup", "picked_up"],
    "dry_cleaning": ["pending", "started", "tagging", "pre_treatment", "dry_cleaning", "pressing", "finishing", "ready_for_pickup", "picked_up"],
    "steam_iron": ["pending", "started", "steaming", "pressing", "finishing", "ready_for_pickup", "picked_up"]
};