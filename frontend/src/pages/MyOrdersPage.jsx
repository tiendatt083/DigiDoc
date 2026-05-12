import { useState, useEffect } from 'react';
import { getUploadUrl } from '../config/env';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, Clock, CreditCard, Download, Package, RefreshCw, XCircle } from 'lucide-react';
import { toast } from '../utils/toast';

const STATUS_MAP = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    icon: <Clock size={12}/>,
    cls: { bg: '#fff7e8', color: '#b45309', border: '#fed7aa' },
  },
  PAID: {
    label: 'Đã thanh toán',
    icon: <CheckCircle size={12}/>,
    cls: { bg: '#e8fbf5', color: '#0f766e', border: '#b7eadc' },
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: <XCircle size={12}/>,
    cls: { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  },
  EXPIRED: {
    label: 'Hết hạn',
    icon: <XCircle size={12}/>,
    cls: { bg: '#eef4fb', color: '#526274', border: '#dbe6f3' },
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, icon: null, cls: { bg: '#eef4fb', color: '#526274', border: '#dbe6f3' } };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 11px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      background: s.cls.bg,
      color: s.cls.color,
      border: `1px solid ${s.cls.border}`,
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
      toast.error('Không thể tải tài liệu. Vui lòng thử lại.');
    } finally {
      setDownloading(null);
    }
  };

  const handleContinuePayment = (orderCode) => {
    navigate(`/payment/${orderCode}`);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

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
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '42px 24px 78px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 30, flexWrap: 'wrap' }}>
        <div>
          <span className="pill pill-indigo" style={{ marginBottom: 12 }}>
            <Package size={12}/> Lịch sử mua
          </span>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#132033', margin: '0 0 6px', letterSpacing: 0 }}>Đơn hàng của tôi</h1>
          <p style={{ color: '#526274', margin: 0 }}>Tổng: {orders.length} đơn hàng</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary" style={{ padding: '10px 16px' }}>
          <RefreshCw size={15}/> Làm mới
        </button>
      </header>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '68px 28px',
          background: '#ffffff',
          borderRadius: 8,
          border: '1px solid #dbe6f3',
          boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
        }}>
          <Package size={56} color="#9ab0cb" style={{ margin: '0 auto 16px' }}/>
          <h2 style={{ color: '#132033', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>Bạn chưa có đơn hàng nào</h2>
          <p style={{ color: '#526274', fontSize: 15, marginBottom: 22 }}>Khám phá kho tài liệu và bắt đầu lưu tài liệu về tài khoản.</p>
          <Link to="/documents" className="btn-primary">
            Mua tài liệu ngay
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <article key={order.id} style={{
              background: '#ffffff',
              border: order.status === 'PENDING_PAYMENT' ? '1px solid #fed7aa' : '1px solid #dbe6f3',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                padding: '16px 20px',
                background: order.status === 'PENDING_PAYMENT' ? '#fff7e8' : '#f8fbff',
                borderBottom: '1px solid #dbe6f3',
              }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ color: '#8a9aac', fontSize: 11, margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Mã đơn</p>
                    <p style={{ color: '#2563eb', fontWeight: 900, margin: 0, fontFamily: 'monospace', fontSize: 14 }}>#{order.orderCode}</p>
                  </div>
                  <div>
                    <p style={{ color: '#8a9aac', fontSize: 11, margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Ngày đặt</p>
                    <p style={{ color: '#526274', fontWeight: 700, margin: 0, fontSize: 13 }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p style={{ color: '#8a9aac', fontSize: 11, margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Tổng tiền</p>
                    <p style={{ color: '#132033', fontWeight: 900, margin: 0, fontSize: 15 }}>{formatPrice(order.finalAmount)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <StatusBadge status={order.status}/>
                  {order.status === 'PENDING_PAYMENT' && (
                    <button onClick={() => handleContinuePayment(order.orderCode)} className="btn-primary" style={{ padding: '9px 14px', fontSize: 13 }}>
                      <CreditCard size={14}/> Thanh toán ngay
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: '12px 20px' }}>
                {order.items?.map((item, idx) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    padding: '13px 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid #edf2f8' : 'none',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{
                        width: 54,
                        height: 54,
                        borderRadius: 8,
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#eef6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                      }}>
                        {item.document?.thumbnailPath ? (
                          <img src={getUploadUrl(item.document.thumbnailPath) || ''} alt={item.document?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={24}/>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: '#132033', fontWeight: 900, margin: 0, fontSize: 14 }}>{item.document?.title || 'Sản phẩm'}</p>
                        <p style={{ color: '#526274', margin: '4px 0 0', fontSize: 12 }}>{formatPrice(item.price)} x {item.quantity}</p>
                      </div>
                    </div>

                    {order.status === 'PAID' && (
                      <button onClick={() => handleDownload(item.document.id, item.document.title)} disabled={downloading === item.document.id} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13, color: '#0f766e', borderColor: '#b7eadc' }}>
                        <Download size={14}/>
                        {downloading === item.document.id ? 'Đang tải...' : 'Tải xuống'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyOrdersPage;
