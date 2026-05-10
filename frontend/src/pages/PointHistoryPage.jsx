import { useState, useEffect } from 'react';
import { Star, Gift, TrendingUp, TrendingDown } from 'lucide-react';
import { getMyPoints, getMyPointHistory } from '../api/adminApi';

const formatDate = (str) =>
  str ? new Date(str).toLocaleString('vi-VN') : '—';

export default function PointHistoryPage() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyPoints(), getMyPointHistory()])
      .then(([pointRes, histRes]) => {
        setPoints(pointRes.data?.rewardPoints || 0);
        setHistory(histRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/>
      <span style={{ color: '#94a3b8' }}>Đang tải...</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: 20, padding: '32px',
        textAlign: 'center', marginBottom: 32,
        boxShadow: '0 10px 40px rgba(99,102,241,0.3)'
      }}>
        <Star size={40} style={{ color: '#fde68a', marginBottom: 12, fill: '#fde68a' }}/>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 8px' }}>
          Tổng điểm tích lũy
        </p>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          {points.toLocaleString('vi-VN')}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 }}>
          điểm ≈ {(points * 10000).toLocaleString('vi-VN')}₫ giá trị
        </p>
        <div style={{
          marginTop: 20, padding: '10px 20px',
          background: 'rgba(255,255,255,0.15)', borderRadius: 12,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: '#fff', fontSize: 13
        }}>
          <Gift size={16}/>
          10.000₫ chi tiêu = 1 điểm thưởng
        </div>
      </div>

      {/* History */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📋 Lịch sử điểm
        </h2>

        {history.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, color: '#64748b'
          }}>
            <Star size={40} style={{ marginBottom: 12, opacity: 0.3 }}/>
            <p>Chưa có lịch sử điểm nào</p>
            <p style={{ fontSize: 13 }}>Hãy mua sản phẩm để tích điểm!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '16px 20px', gap: 16
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: item.type === 'EARN'
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {item.type === 'EARN'
                    ? <TrendingUp size={18} style={{ color: '#10b981' }}/>
                    : <TrendingDown size={18} style={{ color: '#ef4444' }}/>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>
                    {item.reason}
                  </p>
                  <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 12 }}>
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <div style={{
                  fontWeight: 800, fontSize: 18,
                  color: item.type === 'EARN' ? '#34d399' : '#f87171'
                }}>
                  {item.type === 'EARN' ? '+' : '-'}{item.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
