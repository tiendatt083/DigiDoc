import { useState, useEffect } from 'react';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../../api/adminApi';

const STATUS_MAP = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#f59e0b' },
  PAID: { label: 'Đã thanh toán', color: '#10b981' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444' },
  EXPIRED: { label: 'Hết hạn', color: '#64748b' },
};

const ORDER_STATUSES = Object.keys(STATUS_MAP);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    adminGetAllOrders()
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    await adminUpdateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdatingId(null);
  };

  const formatCurrency = (val) =>
    val !== null && val !== undefined
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
      : '—';

  const formatDate = (str) => str ? new Date(str).toLocaleString('vi-VN') : '—';

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Tất cả đơn hàng trong hệ thống</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner"/></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Mã đơn</th><th>Khách hàng</th>
                <th>Tổng tiền</th><th>Giảm giá</th><th>Thanh toán</th>
                <th>Trạng thái</th><th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="8" className="empty-row">Chưa có đơn hàng nào</td></tr>
              ) : orders.map((order, i) => (
                <tr key={order.id}>
                  <td>{i + 1}</td>
                  <td><code>{order.orderCode}</code></td>
                  <td>{order.user?.email || '—'}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>{formatCurrency(order.discountAmount)}</td>
                  <td><strong>{formatCurrency(order.finalAmount)}</strong></td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      style={{ color: STATUS_MAP[order.status]?.color }}
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_MAP[s]?.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
