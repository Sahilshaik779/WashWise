// api.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// ----------------- Authentication -----------------
export const registerUser = async (username, password, role) => {
  const res = await axios.post(`${API_URL}/register`, {
    username,
    password,
    role,
  });
  return res.data;
};

export const loginUser = async (username, password) => {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  return res.data;
};

// ----------------- Users -----------------
export const getAllUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ----------------- Customers -----------------
export const addCustomer = async (customerData) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_URL}/customers`, customerData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMyOrders = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/customers/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getCustomers = async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  let url = `${API_URL}/customers`;
  if (role === "customer") {
    url += "/me";
  }
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateStatus = async (id, status) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(
    `${API_URL}/customers/${id}/status`,
    null,
    {
      params: { status },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const updateStatusByQR = async (customerId) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(
    `${API_URL}/customers/qr/${customerId}/status`,
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// -----------------
// 🚨 THIS IS THE FIX 🚨
// -----------------
// DELETED the old getCustomerByQR and getOrderByID functions
// and REPLACED them with this single, correct version.
export const getOrderByID = async (qr_code) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`${API_URL}/customers/qr/${qr_code}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    // This makes sure backend errors (like "Order not found") are handled correctly
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    // This will handle the "not valid JSON" error if the endpoint is still wrong
    throw error;
  }
};


// ----------------- Password Change -----------------
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API_URL}/change-password`, {
    current_password: currentPassword,
    new_password: newPassword
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};