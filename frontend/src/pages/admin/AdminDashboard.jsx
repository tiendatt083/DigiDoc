import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, ShoppingBag, FileText, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { getDashboardSummary } from '../../api/adminApi';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="admin-stat-card">
    <div className="stat-icon" style={{ background: `${color}20`, color }}>
      <Icon size={24} />
    </div>
    <div className="stat-info">
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardSummary()
      .then(res => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"/>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const totalRevenue = summary?.totalRevenue ?? 0;

  const stats = [
    {
      title: 'Doanh thu (đơn PAID)',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: '#6366f1',
    },
    {
      title: 'Tổng đơn hàng',
      value: (summary?.totalOrders || 0).toLocaleString('vi-VN'),
      icon: ShoppingBag,
      color: '#10b981',
    },
    {
      title: 'Tổng người dùng',
      value: (summary?.totalUsers || 0).toLocaleString('vi-VN'),
      icon: Users,
      color: '#f59e0b',
    },
    {
      title: 'Tổng tài liệu',
      value: (summary?.totalDocuments || 0).toLocaleString('vi-VN'),
      icon: FileText,
      color: '#8b5cf6',
    },
  ];

  const quickActions = [
    { label: 'Thêm tài liệu mới', to: '/admin/documents', icon: '📄', color: '#6366f1' },
    { label: 'Quản lý đơn hàng', to: '/admin/orders', icon: '📦', color: '#10b981' },
    { label: 'Tạo voucher', to: '/admin/vouchers', icon: '🎫', color: '#f59e0b' },
    { label: 'Viết blog', to: '/admin/blogs', icon: '✍️', color: '#8b5cf6' },
    { label: 'Quản lý danh mục', to: '/admin/categories', icon: '🏷️', color: '#06b6d4' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1>📊 Tổng quan</h1>
          <p>Dữ liệu thống kê thực từ hệ thống</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Order Status Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="admin-stat-card" style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-title">Đơn đã thanh toán</p>
            <p className="stat-value" style={{ color: '#34d399' }}>
              {(summary?.paidOrders || 0).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="admin-stat-card" style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-title">Đơn chờ xử lý</p>
            <p className="stat-value" style={{ color: '#fbbf24' }}>
              {(summary?.pendingOrders || 0).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue chart - chỉ hiện khi có dữ liệu */}
      {Number(totalRevenue) > 0 && (
        <div className="admin-chart-card">
          <div className="chart-header">
            <h2>Doanh thu tích lũy</h2>
            <span className="chart-badge">Đơn đã thanh toán</span>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <TrendingUp size={48} style={{ marginBottom: 12, color: '#6366f1', opacity: 0.5 }}/>
            <p>Biểu đồ chi tiết theo ngày sẽ có khi tích hợp đầy đủ.</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#a5b4fc', marginTop: 8 }}>
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h2>⚡ Thao tác nhanh</h2>
        <div className="quick-action-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="quick-action-btn"
              style={{ border: `1px solid ${action.color}22`, cursor: 'pointer' }}
            >
              <span className="quick-action-icon">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


