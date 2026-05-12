import { useState, useEffect } from 'react';
import { Gift, Star, TrendingDown, TrendingUp } from 'lucide-react';
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
      <span style={{ color: '#526274' }}>Đang tải điểm thưởng...</span>
    </div>
  );

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '42px 24px 78px' }}>
      <section style={{
        background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
        borderRadius: 8,
        padding: 34,
        textAlign: 'center',
        marginBottom: 28,
        boxShadow: '0 18px 46px rgba(37,99,235,0.18)',
        color: '#ffffff',
      }}>
        <Star size={42} style={{ color: '#fde68a', marginBottom: 12, fill: '#fde68a' }}/>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, margin: '0 0 8px', fontWeight: 800 }}>
          Tổng điểm tích lũy
        </p>
        <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1 }}>{points.toLocaleString('vi-VN')}</div>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 10 }}>
          điểm tương đương {(points * 10000).toLocaleString('vi-VN')}đ giá trị quy đổi
        </p>
        <div style={{
          marginTop: 20,
          padding: '10px 18px',
          background: 'rgba(255,255,255,0.16)',
          borderRadius: 8,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: '#fff',
          fontSize: 13,
          fontWeight: 800,
          border: '1px solid rgba(255,255,255,0.22)',
        }}>
          <Gift size={16}/>
          10.000đ chi tiêu = 1 điểm thưởng
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#132033', margin: '0 0 16px' }}>
          Lịch sử điểm
        </h2>

        {history.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '52px 20px',
            background: '#ffffff',
            border: '1px solid #dbe6f3',
            borderRadius: 8,
            color: '#526274',
            boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
          }}>
            <Star size={42} color="#9ab0cb" style={{ marginBottom: 12 }}/>
            <p style={{ margin: '0 0 5px', fontWeight: 900, color: '#132033' }}>Chưa có lịch sử điểm nào</p>
            <p style={{ fontSize: 13, margin: 0 }}>Mua tài liệu để bắt đầu tích điểm.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((item, idx) => (
              <article key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1px solid #dbe6f3',
                borderRadius: 8,
                padding: '16px 18px',
                gap: 14,
                boxShadow: '0 10px 26px rgba(27,55,100,0.07)',
              }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: item.type === 'EARN' ? '#e8fbf5' : '#fff1f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.type === 'EARN'
                    ? <TrendingUp size={19} style={{ color: '#0f766e' }}/>
                    : <TrendingDown size={19} style={{ color: '#e11d48' }}/>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: '#132033', fontSize: 14, fontWeight: 900 }}>{item.reason}</p>
                  <p style={{ margin: '4px 0 0', color: '#8a9aac', fontSize: 12 }}>{formatDate(item.createdAt)}</p>
                </div>
                <div style={{ fontWeight: 900, fontSize: 19, color: item.type === 'EARN' ? '#0f766e' : '#e11d48' }}>
                  {item.type === 'EARN' ? '+' : '-'}{item.points}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
