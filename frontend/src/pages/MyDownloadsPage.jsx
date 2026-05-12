import { useState, useEffect } from 'react';
import { getUploadUrl } from '../config/env';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Eye, FileText, Package, Star } from 'lucide-react';
import api from '../api/axios';

const formatVND = (val) =>
  val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '—';

const formatDate = (str) =>
  str ? new Date(str).toLocaleDateString('vi-VN') : '—';

export default function MyDownloadsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [reviewingDoc, setReviewingDoc] = useState(null);
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const keys = new Set((reviewsRes.data || []).map(r => `${r.documentId}_${r.orderId}`));
        setReviewedKeys(keys);
      } catch {
        // Không bắt buộc.
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDownload = async (documentId, docTitle) => {
    setDownloading(documentId);
    try {
      const response = await api.get(`/downloads/${documentId}`, { responseType: 'blob' });
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
    } catch {
      alert('Không thể tải file. Vui lòng thử lại!');
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = async (documentId) => {
    try {
      const response = await api.get(`/downloads/${documentId}/preview`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch {
      alert('Không thể xem trước sản phẩm này hoặc sản phẩm không có file xem trước.');
    }
  };

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
      alert(err.response?.data?.error || 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/>
      <span style={{ color: '#526274' }}>Đang tải tài liệu...</span>
    </div>
  );

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '42px 24px 78px' }}>
      <header style={{ marginBottom: 30 }}>
        <span className="pill pill-green" style={{ marginBottom: 12 }}>
          <Download size={12}/> Thư viện cá nhân
        </span>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: '#132033', margin: '0 0 6px', letterSpacing: 0 }}>
          Sản phẩm đã mua
        </h1>
        <p style={{ color: '#526274', margin: 0 }}>Tất cả tài liệu đã thanh toán, có thể tải về bất kỳ lúc nào.</p>
      </header>

      {purchasedItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '74px 24px',
          background: '#ffffff',
          border: '1px solid #dbe6f3',
          borderRadius: 8,
          boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
        }}>
          <Package size={58} color="#9ab0cb" style={{ marginBottom: 16 }}/>
          <h2 style={{ color: '#132033', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>Chưa có sản phẩm nào</h2>
          <p style={{ color: '#526274', marginBottom: 24 }}>Hãy khám phá kho tài liệu và bắt đầu mua sắm.</p>
          <button onClick={() => navigate('/documents')} className="btn-primary">
            Khám phá tài liệu
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {purchasedItems.map((item, idx) => (
            <article key={`${item.document?.id || idx}_${item.orderId}`} style={{
              background: '#ffffff',
              border: '1px solid #dbe6f3',
              borderRadius: 8,
              padding: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
              boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
            }}>
              <div style={{
                width: 62,
                height: 62,
                borderRadius: 8,
                background: '#eef6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                {item.document?.thumbnailPath ? (
                  <img src={getUploadUrl(item.document.thumbnailPath) || ''} alt={item.document?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FileText size={28}/>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#132033', margin: '0 0 6px' }}>
                  {item.document?.title || 'Sản phẩm'}
                </h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#526274', fontSize: 12, fontWeight: 700 }}>
                  <span>Đơn: <code style={{ color: '#2563eb', background: '#e8f1ff', padding: '2px 6px', borderRadius: 6 }}>{item.orderCode}</code></span>
                  <span>Ngày mua: {formatDate(item.orderDate)}</span>
                  <span>{item.quantity} x {formatVND(item.price)}</span>
                  <span style={{ color: '#0f766e', background: '#e8fbf5', padding: '2px 8px', borderRadius: 999 }}>
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
                {item.document?.fileType === 'application/pdf' && (
                  <button onClick={() => handlePreview(item.document.id)} className="btn-secondary" style={{ padding: '8px 13px', fontSize: 13 }}>
                    <Eye size={14}/> Xem
                  </button>
                )}
                {reviewedKeys.has(`${item.document?.id}_${item.orderId}`) ? (
                  <button disabled className="btn-secondary" style={{ padding: '8px 13px', fontSize: 13, color: '#526274', borderColor: '#dbe6f3', cursor: 'default' }}>
                    <CheckCircle size={14}/> Đã đánh giá
                  </button>
                ) : (
                  <button onClick={() => { setReviewingDoc(item.document); setReviewingOrderId(item.orderId); }} className="btn-secondary" style={{ padding: '8px 13px', fontSize: 13, color: '#b45309', borderColor: '#fed7aa' }}>
                    <Star size={14} fill="currentColor"/> Đánh giá
                  </button>
                )}
                <button onClick={() => handleDownload(item.document?.id, item.document?.title)} disabled={downloading === item.document?.id} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
                  <Download size={14}/>
                  {downloading === item.document?.id ? 'Đang tải...' : 'Tải về'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {reviewingDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: 20,
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #dbe6f3',
            borderRadius: 8,
            padding: 28,
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 25px 60px rgba(27,55,100,0.18)',
          }}>
            <h3 style={{ fontSize: 21, fontWeight: 900, color: '#132033', margin: '0 0 8px' }}>Đánh giá sản phẩm</h3>
            <p style={{ color: '#526274', fontSize: 14, marginBottom: 22 }}>{reviewingDoc.title}</p>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 22, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: star <= rating ? '#f59e0b' : '#cbd5e1',
                  transition: 'color 0.2s',
                }}>
                  <Star size={32} fill="currentColor" />
                </button>
              ))}
            </div>

            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              style={{
                width: '100%',
                padding: 15,
                background: '#f8fbff',
                border: '1px solid #dbe6f3',
                borderRadius: 8,
                color: '#132033',
                fontSize: 14,
                minHeight: 122,
                resize: 'vertical',
                marginBottom: 20,
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setReviewingDoc(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Hủy
              </button>
              <button onClick={handleSubmitReview} disabled={isSubmitting} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
