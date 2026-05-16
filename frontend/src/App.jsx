import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './context/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DocumentListPage from './pages/DocumentListPage';
import DocumentDetailPage from './pages/DocumentDetailPage';

// User protected pages
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import MyOrdersPage from './pages/MyOrdersPage';
import MyDownloadsPage from './pages/MyDownloadsPage';
import PointHistoryPage from './pages/PointHistoryPage';
import ProfilePage from './pages/ProfilePage';

// Blog pages
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVouchersPage from './pages/admin/AdminVouchersPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminTrashPage from './pages/admin/AdminTrashPage';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles?.includes('ROLE_ADMIN')) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public & User Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="documents" element={<DocumentListPage />} />
          <Route path="documents/:slug" element={<DocumentDetailPage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />

          <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="payment/:orderCode" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
          <Route path="my-downloads" element={<ProtectedRoute><MyDownloadsPage /></ProtectedRoute>} />
          <Route path="my-points" element={<ProtectedRoute><PointHistoryPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="documents" element={<AdminDocumentsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="blogs" element={<AdminBlogsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="trash" element={<AdminTrashPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

