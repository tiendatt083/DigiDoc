import { useState, useEffect } from 'react';
import { getUploadUrl } from '../config/env';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Package, Download, CreditCard, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const STATUS_MAP = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    icon: <Clock size={12}/>,
    cls: { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
  },
  PAID: {
    label: 'Đã thanh toán',
    icon: <CheckCircle size={12}/>,
    cls: { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: <XCircle size={12}/>,
    cls: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
  },
  EXPIRED: {
    label: 'Hết hạn',
    icon: <XCircle size={12}/>,
    cls: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, icon: null, cls: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' } };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: s.cls.bg, color: s.cls.color,
      border: `1px solid ${s.cls.border}`
    }}>
      {s.icon} {s.label}
    </span>
  );
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data || []);
    } catch (error) {
      console.error('Không thể tải đơn hàng', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDownload = async (documentId, title) => {
    setDownloading(documentId);
    try {
      const res = await api.get(`/downloads/${documentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;

      const disposition = res.headers['content-disposition'];
      let filename = title;
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Tải xuống thất bại. Vui lòng thử lại.');
    } finally {
      setDownloading(null);
    }
  };

  /** Tiếp tục thanh toán — chuyển đến trang payment với orderCode */
  const handleContinuePayment = (orderCode) => {
    navigate(`/payment/${orderCode}`);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner" style={{ width: 36, height: 36 }}/>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>📦 Đơn hàng của tôi</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Tổng: {orders.length} đơn hàng</p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            color: '#a5b4fc', cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}
        >
          <RefreshCw size={14}/> Làm mới
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 32px',
          background: 'rgba(15,23,42,0.8)', borderRadius: 16,
          border: '1px solid rgba(99,102,241,0.1)'
        }}>
          <Package size={56} style={{ color: '#334155', margin: '0 auto 16px' }}/>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 20 }}>Bạn chưa có đơn hàng nào</p>
          <Link to="/documents" style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', textDecoration: 'none', fontWeight: 700
          }}>
            Mua sản phẩm ngay →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order.id} style={{
              background: 'rgba(15,23,42,0.8)',
              border: order.status === 'PENDING_PAYMENT'
                ? '1px solid rgba(245,158,11,0.3)'
                : '1px solid rgba(99,102,241,0.1)',
              borderRadius: 16, overflow: 'hidden'
            }}>
              {/* Order header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12,
                padding: '16px 20px',
                background: order.status === 'PENDING_PAYMENT'
                  ? 'rgba(245,158,11,0.05)'
                  : 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mã đơn</p>
                    <p style={{ color: '#a5b4fc', fontWeight: 700, margin: 0, fontFamily: 'monospace', fontSize: 14 }}>
                      #{order.orderCode}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ngày đặt</p>
                    <p style={{ color: '#94a3b8', fontWeight: 500, margin: 0, fontSize: 13 }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tổng tiền</p>
                    <p style={{ color: '#a5b4fc', fontWeight: 700, margin: 0, fontSize: 15 }}>
                      {formatPrice(order.finalAmount)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={order.status}/>

                  {/* Nút tiếp tục thanh toán cho PENDING_PAYMENT */}
                  {order.status === 'PENDING_PAYMENT' && (
                    <button
                      onClick={() => handleContinuePayment(order.orderCode)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 8,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none', color: '#fff',
                        cursor: 'pointer', fontSize: 13, fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(245,158,11,0.3)'
                      }}
                    >
                      <CreditCard size={14}/> Thanh toán ngay
                    </button>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div style={{ padding: '12px 20px' }}>
                {order.items?.map((item, idx) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                        background: 'rgba(99,102,241,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {item.document?.thumbnailPath ? (
                          <img
                            src={(getUploadUrl(item.document.thumbnailPath) || "")}
                            alt={item.document?.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: 22 }}>📄</span>
                        )}
                      </div>
                      <div>
                        <p style={{ color: '#e2e8f0', fontWeight: 600, margin: 0, fontSize: 14 }}>
                          {item.document?.title || 'Sản phẩm'}
                        </p>
                        <p style={{ color: '#64748b', margin: 0, fontSize: 12 }}>
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Nút tải xuống — chỉ cho đơn PAID */}
                    {order.status === 'PAID' && (
                      <button
                        onClick={() => handleDownload(item.document.id, item.document.title)}
                        disabled={downloading === item.document.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', borderRadius: 8,
                          background: downloading === item.document.id ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.15)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10b981', cursor: downloading === item.document.id ? 'wait' : 'pointer',
                          fontSize: 13, fontWeight: 600
                        }}
                      >
                        <Download size={14}/>
                        {downloading === item.document.id ? 'Đang tải...' : 'Tải xuống'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
