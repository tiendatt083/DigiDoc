import api from './axios';

// ====================
// Dashboard
// ====================
export const getDashboardSummary = () => api.get('/admin/dashboard/summary');
export const getRevenueChart = () => api.get('/admin/dashboard/revenue');

// ====================
// Admin Documents
// ====================
export const adminGetAllDocuments = () => api.get('/admin/documents');
export const adminCreateDocument = (formData) => api.post('/admin/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateDocument = (id, formData) => api.put(`/admin/documents/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteDocument = (id) => api.delete(`/admin/documents/${id}`);
export const adminRestoreDocument = (id) => {
  const fd = new FormData();
  fd.append('status', 'ACTIVE');
  return api.put(`/admin/documents/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ====================
// Categories
// ====================
export const getAllCategories = () => api.get('/categories');
export const adminCreateCategory = (data) => api.post('/admin/categories', data);
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// ====================
// Orders
// ====================
export const adminGetAllOrders = () => api.get('/admin/orders');
export const adminUpdateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });

// ====================
// Users
// ====================
export const adminGetAllUsers = () => api.get('/admin/users');
export const adminUpdateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`);

// ====================
// Vouchers
// ====================
export const adminGetAllVouchers = () => api.get('/admin/vouchers');
export const adminCreateVoucher = (data) => api.post('/admin/vouchers', data);
export const adminUpdateVoucher = (id, data) => api.put(`/admin/vouchers/${id}`, data);
export const adminDeleteVoucher = (id) => api.delete(`/admin/vouchers/${id}`);

// ====================
// Blogs
// ====================
export const adminGetAllBlogs = () => api.get('/admin/blogs');
export const adminCreateBlog = (data) => api.post('/admin/blogs', data);
export const adminUpdateBlog = (id, data) => api.put(`/admin/blogs/${id}`, data);
export const adminDeleteBlog = (id) => api.delete(`/admin/blogs/${id}`);

// ====================
// Payment
// ====================
export const createPayment = (orderCode, paymentMethod) => api.post(`/payments/create?orderCode=${orderCode}&paymentMethod=${paymentMethod}`);
export const getPaymentQR = (orderCode) => api.get(`/payments/qr/${orderCode}`);

// ====================
// Points
// ====================
export const getMyPoints = () => api.get('/points/me');
export const getMyPointHistory = () => api.get('/points/history');
