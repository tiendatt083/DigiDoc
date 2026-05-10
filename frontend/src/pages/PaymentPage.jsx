import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getPaymentQR } from '../api/adminApi';
import { CheckCircle, AlertCircle, Clock, RefreshCw, XCircle } from 'lucide-react';

const formatVND = (val) =>
  val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '—';

const PaymentPage = () => {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [qrInfo, setQrInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false); // trạng thái khi click "Kiểm tra"
  const [paid, setPaid] = useState(false);
  const [statusMsg, setStatusMsg] = useState(''); // thông báo sau kiểm tra
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes
  const navigate = useNavigate();

  // Lần đầu load: lấy cả order + QR
  const fetchData = useCallback(async () => {
    try {
      const orderRes = await api.get(`/orders/${orderCode}`);
      setOrder(orderRes.data);
      if (orderRes.data.status === 'PAID') {
        setPaid(true);
        setTimeout(() => navigate('/my-orders'), 2000);
        return;
      }
      // Lấy QR song song, không ảnh hưởng nếu lỗi
      try {
        const qrRes = await getPaymentQR(orderCode);
        setQrInfo(qrRes.data);
      } catch {
        // QR fail → bỏ qua, vẫn hiện trang
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderCode, navigate]);

  // Chỉ check status đơn hàng (không reload QR)
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
        setStatusMsg('⚠️ Đơn hàng đã hết hạn hoặc bị hủy.');
      } else {
        setStatusMsg('⏳ Chưa nhận được thanh toán. Vui lòng thử lại sau.');
      }
    } catch {
      setStatusMsg('❌ Không thể kiểm tra. Vui lòng thử lại.');
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

  // Auto-poll mỗi 5 giây để phát hiện thanh toán từ SePay webhook
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
        // silent — không ngắt polling nếu lỗi nhất thời
      }
    }, 5000); // poll mỗi 5 giây
    return () => clearInterval(pollInterval);
  }, [paid, orderCode, navigate]);

  // Countdown timer
  useEffect(() => {
    if (paid) return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0; }
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 12, color: '#94a3b8' }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/> Đang tải...
    </div>
  );

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#ef4444' }}>
      <AlertCircle size={48} style={{ marginBottom: 16 }}/>
      <p>Không tìm thấy đơn hàng</p>
    </div>
  );

  if (paid) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#10b981' }}>
      <CheckCircle size={64} style={{ marginBottom: 16 }}/>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#34d399' }}>Thanh toán thành công! 🎉</h2>
      <p style={{ color: '#64748b', marginTop: 8 }}>Đang chuyển đến đơn hàng của bạn...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 540, margin: '40px auto', padding: '0 20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #151526, #1a1a35)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 24,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>💳 Thanh toán đơn hàng</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 13 }}>Mã đơn: <strong>{orderCode}</strong></p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Countdown */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, marginBottom: 20,
            background: countdown < 60 ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
            color: countdown < 60 ? '#f87171' : '#a5b4fc',
            fontSize: 14, fontWeight: 600
          }}>
            <Clock size={16}/>
            Hết hạn sau: <strong>{formatCountdown(countdown)}</strong>
          </div>

          {/* QR Code from VietQR */}
          {qrInfo?.qrImageUrl && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                display: 'inline-block', background: '#fff',
                padding: 12, borderRadius: 16,
                boxShadow: '0 0 30px rgba(99,102,241,0.3)'
              }}>
                <img
                  src={qrInfo.qrImageUrl}
                  alt="QR Chuyển khoản"
                  style={{ width: 220, height: 220, display: 'block' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
                Quét mã QR bằng app ngân hàng để thanh toán
              </p>
            </div>
          )}

          {/* Transfer Info */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: 16, marginBottom: 20
          }}>
            {[
              ['Ngân hàng', qrInfo?.bankName || 'MB Bank'],
              ['Số tài khoản', qrInfo?.bankAccount || '0394566547'],
              ['Chủ tài khoản', qrInfo?.accountHolder || 'NGUYEN VAN A'],
              ['Số tiền', formatVND(order?.finalAmount)],
              ['Nội dung CK', qrInfo?.transferContent || `DIGIDOC ${orderCode}`],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>{label}</span>
                <span style={{
                  color: label === 'Số tiền' ? '#a5b4fc' : '#e2e8f0',
                  fontWeight: label === 'Số tiền' ? 800 : 500,
                  fontSize: label === 'Số tiền' ? 16 : 13
                }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Check status button */}
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            style={{
              width: '100%', padding: '12px', marginBottom: 8,
              background: checking ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 10, color: checking ? '#6366f1' : '#a5b4fc', fontSize: 14,
              fontWeight: 600, cursor: checking ? 'not-allowed' : 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }}/>
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái thanh toán'}
          </button>
          {statusMsg && (
            <p style={{
              textAlign: 'center', fontSize: 13, marginBottom: 12,
              color: statusMsg.startsWith('❌') ? '#f87171' : '#94a3b8',
              padding: '8px 12px', borderRadius: 8,
              background: statusMsg.startsWith('❌') ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)'
            }}>
              {statusMsg}
            </p>
          )}

          {/* Nút hủy đơn */}
          <button
            onClick={handleCancelOrder}
            style={{
              width: '100%', padding: '11px',
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 10, color: '#f87171', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <XCircle size={15}/> Hủy đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

