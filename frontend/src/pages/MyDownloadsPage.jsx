import { useState, useEffect } from 'react';
import { getUploadUrl } from '../config/env';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, FileText, AlertCircle, Package, Star, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const formatVND = (val) =>
  val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '—';

const formatDate = (str) =>
  str ? new Date(str).toLocaleDateString('vi-VN') : '—';

const FILE_ICONS = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📑',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📑',
};

const getFileIcon = (type) => FILE_ICONS[type] || '📁';

export default function MyDownloadsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [reviewingDoc, setReviewingDoc] = useState(null);
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set dạng "documentId_orderId" để check theo từng đơn
  const [reviewedKeys, setReviewedKeys] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await api.get('/orders/my-orders');
        const paidOrders = ordersRes.data.filter(o => o.status === 'PAID');
        setOrders(paidOrders);
      } catch (err) {
        console.error('Lỗi tải đơn hàng:', err);
      }

      try {
        const reviewsRes = await api.get('/reviews/me');
        // API trả về [{documentId, orderId}]
        const keys = new Set((reviewsRes.data || []).map(r => `${r.documentId}_${r.orderId}`));
        setReviewedKeys(keys);
      } catch (err) {
        // không bắt buộc — bỏ qua nếu lỗi
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDownload = async (documentId, docTitle) => {
    setDownloading(documentId);
    try {
      const response = await api.get(`/downloads/${documentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const disposition = response.headers['content-disposition'];
      let filename = docTitle;
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
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Không thể tải file. Vui lòng thử lại!');
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = async (documentId) => {
    try {
      const response = await api.get(`/downloads/${documentId}/preview`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      alert('Không thể xem trước sản phẩm này hoặc sản phẩm không có file xem trước.');
    }
  };

  // Flatten all purchased items from paid orders
  const purchasedItems = orders.flatMap(order =>
    (order.items || []).map(item => ({
      ...item,
      orderCode: order.orderCode,
      orderDate: order.createdAt,
      orderId: order.id,
    }))
  );

  const handleSubmitReview = async () => {
    if (!reviewingDoc) return;
    setIsSubmitting(true);
    try {
      await api.post(`/reviews/${reviewingDoc.id}`, { rating, comment, orderId: reviewingOrderId });
      alert('Đánh giá thành công! Cảm ơn bạn.');
      setReviewedKeys(prev => new Set([...prev, `${reviewingDoc.id}_${reviewingOrderId}`]));
      setReviewingDoc(null);
      setReviewingOrderId(null);
      setRating(5);
      setComment('');
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert('Đã xảy ra lỗi, vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/>
      <span style={{ color: '#94a3b8' }}>Đang tải...</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px' }}>
          📥 Sản phẩm đã mua
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Tất cả sản phẩm bạn đã thanh toán — tải về bất kỳ lúc nào
        </p>
      </div>

      {purchasedItems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20
        }}>
          <Package size={64} style={{ color: '#374151', marginBottom: 16 }}/>
          <h2 style={{ color: '#6b7280', fontSize: 20, fontWeight: 600 }}>
            Chưa có sản phẩm nào
          </h2>
          <p style={{ color: '#4b5563', marginBottom: 24 }}>
            Hãy khám phá kho sản phẩm và bắt đầu mua sắm!
          </p>
          <button
            onClick={() => navigate('/documents')}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontWeight: 700, cursor: 'pointer',
              fontSize: 14
            }}
          >
            Khám phá sản phẩm →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {purchasedItems.map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              transition: 'border-color 0.2s',
            }}>
              {/* File Icon */}
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, flexShrink: 0
              }}>
                {item.document?.thumbnailPath ? (
                  <img
                    src={(getUploadUrl(item.document.thumbnailPath) || "")}
                    alt={item.document?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}
                  />
                ) : (
                  getFileIcon(item.document?.fileType)
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: 15, fontWeight: 700, color: '#f1f5f9',
                  margin: '0 0 4px', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {item.document?.title || 'Sản phẩm'}
                </h3>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                   <span style={{ color: '#64748b', fontSize: 12 }}>📦 Đơn: <code style={{ color: '#a5b4fc' }}>{item.orderCode}</code></span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>📅 {formatDate(item.orderDate)}</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>
                    x{item.quantity} × {formatVND(item.price)}
                  </span>
                  <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    = {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {item.document?.fileType === 'application/pdf' && (
                  <button
                    onClick={() => handlePreview(item.document.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: '#a5b4fc', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <Eye size={14}/> Xem
                  </button>
                )}
                {reviewedKeys.has(`${item.document?.id}_${item.orderId}`) ? (
                  <button
                    disabled
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', fontSize: 13, fontWeight: 600,
                      cursor: 'default'
                    }}
                  >
                    <CheckCircle size={14} /> Đã đánh giá
                  </button>
                ) : (
                  <button
                    onClick={() => { setReviewingDoc(item.document); setReviewingOrderId(item.orderId); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      color: '#f59e0b', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <Star size={14} fill="currentColor" /> Đánh giá
                  </button>
                )}
                <button
                  onClick={() => handleDownload(item.document?.id, item.document?.title)}
                  disabled={downloading === item.document?.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 10,
                    background: downloading === item.document?.id
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    cursor: downloading === item.document?.id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Download size={14}/>
                  {downloading === item.document?.id ? 'Đang tải...' : 'Tải về'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingDoc && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 20
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 460,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8, marginTop: 0 }}>Đánh giá sản phẩm</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>{reviewingDoc.title}</p>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: star <= rating ? '#f59e0b' : '#475569',
                  transition: 'color 0.2s'
                }}>
                  <Star size={32} fill="currentColor" />
                </button>
              ))}
            </div>

            <textarea 
              value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              style={{
                width: '100%', padding: 16, background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                color: '#fff', fontSize: 14, minHeight: 120, resize: 'vertical',
                marginBottom: 24
              }}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setReviewingDoc(null)}
                style={{
                  flex: 1, padding: '12px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
                  color: '#e2e8f0', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                style={{
                  flex: 2, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
