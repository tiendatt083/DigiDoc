import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import {
  LayoutDashboard, FileText, ShoppingBag, Users, LogOut,
  Tag, BookOpen, Home, ChevronRight, Star, Trash2
} from 'lucide-react';

const PREVIEW_ITEMS = [
  { label: 'Trang chủ', path: '/', icon: Home, exact: true },
  { label: 'Bảng điều khiển', path: '/admin', icon: LayoutDashboard, exact: true },
];

const MANAGEMENT_ITEMS = [
  { label: 'Tài liệu', path: '/admin/documents', icon: FileText },
  { label: 'Danh mục', path: '/admin/categories', icon: Tag },
  { label: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Người dùng', path: '/admin/users', icon: Users },
  { label: 'Voucher', path: '/admin/vouchers', icon: Tag },
  { label: 'Blog', path: '/admin/blogs', icon: BookOpen },
  { label: 'Đánh giá', path: '/admin/reviews', icon: Star },
  { label: 'Thùng rác', path: '/admin/trash', icon: Trash2, danger: true },
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
          <div className="sidebar-logo"><BookOpen size={22}/></div>
          <div>
            <h1 className="sidebar-title">DiGiDoc</h1>
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
          <p className="nav-section-label">GIAO DIỆN WEBSITE</p>
          {PREVIEW_ITEMS.map(({ label, path, icon: Icon, exact }) => (
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

          <p className="nav-section-label nav-section-label-spaced">QUẢN TRỊ</p>
          {MANAGEMENT_ITEMS.map(({ label, path, icon: Icon, exact, danger }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${danger ? 'nav-link-danger' : ''}`}
            >
              <Icon size={18}/>
              <span>{label}</span>
              <ChevronRight size={14} className="nav-arrow"/>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
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
