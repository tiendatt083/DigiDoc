import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import {
  LayoutDashboard, FileText, ShoppingBag, Users, LogOut,
  Tag, BookOpen, Home, ChevronRight, Star
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Tài liệu', path: '/admin/documents', icon: FileText },
  { label: 'Danh mục', path: '/admin/categories', icon: Tag },
  { label: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Người dùng', path: '/admin/users', icon: Users },
  { label: 'Voucher', path: '/admin/vouchers', icon: Tag },
  { label: 'Blog', path: '/admin/blogs', icon: BookOpen },
  { label: 'Đánh giá', path: '/admin/reviews', icon: Star },
];

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">📚</div>
          <div>
            <h1 className="sidebar-title">DigiDoc</h1>
            <p className="sidebar-subtitle">Bảng điều khiển</p>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="sidebar-user-name">{user?.fullName || 'Admin'}</p>
            <p className="sidebar-user-email">{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">MENU CHÍNH</p>
          {NAV_ITEMS.map(({ label, path, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18}/>
              <span>{label}</span>
              <ChevronRight size={14} className="nav-arrow"/>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => navigate('/')} className="nav-link">
            <Home size={18}/><span>Về trang chủ</span>
          </button>
          <button onClick={handleLogout} className="nav-link logout">
            <LogOut size={18}/><span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

