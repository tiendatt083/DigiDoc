import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getPaymentQR } from '../api/adminApi';
import { AlertCircle, CheckCircle, Clock, CreditCard, RefreshCw, XCircle } from 'lucide-react';

const formatVND = (val) =>
  val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '—';

const PaymentPage = () => {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [qrInfo, setQrInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [countdown, setCountdown] = useState(15 * 60);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const orderRes = await api.get(`/orders/${orderCode}`);
      setOrder(orderRes.data);
      if (orderRes.data.status === 'PAID') {
        setPaid(true);
        setTimeout(() => navigate('/my-orders'), 2000);
        return;
      }
      try {
        const qrRes = await getPaymentQR(orderCode);
        setQrInfo(qrRes.data);
      } catch {
        // QR lỗi thì vẫn hiển thị thông tin chuyển khoản.
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderCode, navigate]);

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMsg('');
    try {
      const res = await api.get(`/orders/${orderCode}`);
      setOrder(res.data);
      if (res.data.status === 'PAID') {
        setPaid(true);
        setTimeout(() => navigate('/my-downloads'), 2000);
      } else if (res.data.status === 'EXPIRED' || res.data.status === 'CANCELLED') {
        setStatusMsg('Đơn hàng đã hết hạn hoặc bị hủy.');
      } else {
        setStatusMsg('Chưa nhận được thanh toán. Vui lòng thử lại sau.');
      }
    } catch {
      setStatusMsg('Không thể kiểm tra trạng thái. Vui lòng thử lại.');
    } finally {
      setChecking(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await api.post(`/orders/cancel/${orderCode}`);
      alert('Đã hủy đơn hàng.');
      navigate('/cart');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng.');
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (paid) return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${orderCode}`);
        if (res.data.status === 'PAID') {
          setPaid(true);
          clearInterval(pollInterval);
          setTimeout(() => navigate('/my-downloads'), 2500);
        }
      } catch {
        // Giữ polling nếu lỗi tạm thời.
      }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [paid, orderCode, navigate]);

  useEffect(() => {
    if (paid) return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paid]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 12, color: '#526274' }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/> Đang tải...
    </div>
  );

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#e11d48' }}>
      <AlertCircle size={48} style={{ marginBottom: 16 }}/>
      <p>Không tìm thấy đơn hàng</p>
    </div>
  );

  if (paid) return (
    <div style={{ textAlign: 'center', padding: '90px 20px', color: '#0f766e' }}>
      <CheckCircle size={64} style={{ marginBottom: 16 }}/>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f766e' }}>Thanh toán thành công</h2>
      <p style={{ color: '#526274', marginTop: 8 }}>Đang chuyển đến tài liệu của bạn...</p>
    </div>
  );

  const isErrorStatus = statusMsg.includes('Không thể') || statusMsg.includes('hết hạn') || statusMsg.includes('bị hủy');

  return (
    <main style={{ maxWidth: 620, margin: '0 auto', padding: '42px 24px 78px' }}>
      <section style={{
        background: '#ffffff',
        border: '1px solid #dbe6f3',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 18px 46px rgba(27,55,100,0.12)',
      }}>
        <header style={{
          background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
          padding: 26,
          textAlign: 'center',
          color: '#ffffff',
        }}>
          <CreditCard size={28} style={{ marginBottom: 10 }}/>
          <h1 style={{ fontSize: 23, fontWeight: 900, margin: 0 }}>Thanh toán đơn hàng</h1>
          <p style={{ color: 'rgba(255,255,255,0.86)', marginTop: 7, fontSize: 13 }}>
            Mã đơn: <strong>{orderCode}</strong>
          </p>
        </header>

        <div style={{ padding: 26 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 18px',
            borderRadius: 8,
            marginBottom: 22,
            background: countdown < 60 ? '#fff1f2' : '#e8f1ff',
            color: countdown < 60 ? '#e11d48' : '#1d4ed8',
            fontSize: 14,
            fontWeight: 900,
            border: countdown < 60 ? '1px solid #fecdd3' : '1px solid #bfdbfe',
          }}>
            <Clock size={16}/>
            Hết hạn sau: <strong>{formatCountdown(countdown)}</strong>
          </div>

          {qrInfo?.qrImageUrl && (
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{
                display: 'inline-block',
                background: '#ffffff',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #dbe6f3',
                boxShadow: '0 14px 34px rgba(27,55,100,0.10)',
              }}>
                <img
                  src={qrInfo.qrImageUrl}
                  alt="QR Chuyển khoản"
                  style={{ width: 230, height: 230, display: 'block' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <p style={{ color: '#526274', fontSize: 12, marginTop: 10 }}>
                Quét mã QR bằng app ngân hàng để thanh toán.
              </p>
            </div>
          )}

          <div style={{
            background: '#f8fbff',
            border: '1px solid #dbe6f3',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}>
            {[
              ['Ngân hàng', qrInfo?.bankName || 'MB Bank'],
              ['Số tài khoản', qrInfo?.bankAccount || '0394566547'],
              ['Chủ tài khoản', qrInfo?.accountHolder || 'NGUYEN VAN A'],
              ['Số tiền', formatVND(order?.finalAmount)],
              ['Nội dung CK', qrInfo?.transferContent || `DIGIDOC ${orderCode}`],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 14,
                padding: '9px 0',
                borderBottom: label === 'Nội dung CK' ? 'none' : '1px solid #edf2f8',
              }}>
                <span style={{ color: '#526274', fontSize: 12, fontWeight: 800 }}>{label}</span>
                <span style={{
                  color: label === 'Số tiền' ? '#2563eb' : '#132033',
                  fontWeight: label === 'Số tiền' ? 900 : 800,
                  fontSize: label === 'Số tiền' ? 17 : 13,
                  textAlign: 'right',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <button onClick={handleCheckStatus} disabled={checking} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
            <RefreshCw size={16} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }}/>
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái thanh toán'}
          </button>

          {statusMsg && (
            <p style={{
              textAlign: 'center',
              fontSize: 13,
              margin: '0 0 12px',
              color: isErrorStatus ? '#e11d48' : '#526274',
              padding: '9px 12px',
              borderRadius: 8,
              background: isErrorStatus ? '#fff1f2' : '#eef6ff',
              border: isErrorStatus ? '1px solid #fecdd3' : '1px solid #dbeafe',
              fontWeight: 700,
            }}>
              {statusMsg}
            </p>
          )}

          <button onClick={handleCancelOrder} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', color: '#e11d48', borderColor: '#fecdd3' }}>
            <XCircle size={15}/> Hủy đơn hàng
          </button>
        </div>
      </section>
    </main>
  );
};

export default PaymentPage;
