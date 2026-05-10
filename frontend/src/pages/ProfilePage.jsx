import { useState, useEffect } from 'react';
import { User, Phone, Mail, Award, Lock, Check, AlertCircle, ShoppingBag, Download } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../context/authStore';
import { toast } from '../utils/toast';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Profile data from server
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile form
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);

  // Change password form
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Order summary
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchOrderCount();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfile(res.data);
      setProfileForm({ fullName: res.data.fullName || '', phoneNumber: res.data.phoneNumber || '' });
    } catch {
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCount = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrderCount(res.data?.length || 0);
    } catch {
      // silent - không ảnh hưởng nếu lỗi
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/user/profile', profileForm);
      setProfile(res.data);
      setEditMode(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch {
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setPwdLoading(true);
    try {
      await api.put('/user/profile/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwd(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đổi mật khẩu thất bại');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }}/>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#f1f5f9' }}>
        👤 Thông tin cá nhân
      </h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Quản lý hồ sơ và bảo mật tài khoản</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* ===== LEFT: Avatar + Stats ===== */}
        <div>
          {/* Avatar card */}
          <div style={{
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16, padding: 28, textAlign: 'center', marginBottom: 16
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, color: '#fff', fontWeight: 700
            }}>
              {profile?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: 0 }}>
              {profile?.fullName}
            </p>
            <p style={{ color: '#6366f1', fontSize: 12, marginTop: 4 }}>
              {profile?.role === 'ROLE_ADMIN' ? '👑 Quản trị viên' : '👤 Thành viên'}
            </p>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{profile?.email}</p>
          </div>

          {/* Quick stats */}
          <div style={{
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16, padding: 20
          }}>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Tóm tắt
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/my-orders" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)',
                textDecoration: 'none', transition: 'background 0.2s'
              }}>
                <div style={{ background: 'rgba(99,102,241,0.2)', borderRadius: 8, padding: 8 }}>
                  <ShoppingBag size={18} style={{ color: '#6366f1' }}/>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>Đơn hàng</p>
                  <p style={{ color: '#f1f5f9', fontWeight: 700, margin: 0 }}>{orderCount}</p>
                </div>
              </Link>
              <Link to="/my-downloads" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)',
                textDecoration: 'none'
              }}>
                <div style={{ background: 'rgba(16,185,129,0.2)', borderRadius: 8, padding: 8 }}>
                  <Download size={18} style={{ color: '#10b981' }}/>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>Sản phẩm đã mua</p>
                  <p style={{ color: '#f1f5f9', fontWeight: 700, margin: 0 }}>Xem →</p>
                </div>
              </Link>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.08)'
              }}>
                <div style={{ background: 'rgba(245,158,11,0.2)', borderRadius: 8, padding: 8 }}>
                  <Award size={18} style={{ color: '#f59e0b' }}/>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>Điểm thưởng</p>
                  <p style={{ color: '#f59e0b', fontWeight: 700, margin: 0 }}>{profile?.rewardPoints || 0} điểm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: Forms ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Profile info form */}
          <div style={{
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16, padding: 28
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: 0 }}>
                📋 Thông tin cơ bản
              </h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc', padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600
                  }}
                >
                  ✏️ Chỉnh sửa
                </button>
              )}
            </div>

            {!editMode ? (
              /* View mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: <User size={16}/>, label: 'Họ và tên', value: profile?.fullName },
                  { icon: <Mail size={16}/>, label: 'Email', value: profile?.email },
                  { icon: <Phone size={16}/>, label: 'Số điện thoại', value: profile?.phoneNumber || 'Chưa cập nhật' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ color: '#6366f1' }}>{icon}</span>
                    <div>
                      <p style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                      <p style={{ color: '#f1f5f9', fontWeight: 600, margin: 0, fontSize: 14 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Edit mode */
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Họ và tên *
                  </label>
                  <input
                    required
                    value={profileForm.fullName}
                    onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)',
                      color: '#f1f5f9', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Số điện thoại
                  </label>
                  <input
                    value={profileForm.phoneNumber}
                    onChange={e => setProfileForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="0xxxxxxxxx"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)',
                      color: '#f1f5f9', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    style={{
                      padding: '8px 20px', borderRadius: 8, background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
                      cursor: 'pointer', fontWeight: 600, fontSize: 13
                    }}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '8px 20px', borderRadius: 8,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none', color: '#fff', cursor: 'pointer',
                      fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <Check size={14}/>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change password */}
          <div style={{
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16, padding: 28
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPwd ? 24 : 0 }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: 0 }}>
                🔒 Đổi mật khẩu
              </h2>
              <button
                onClick={() => setShowPwd(v => !v)}
                style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600
                }}
              >
                {showPwd ? '✕ Đóng' : '🔑 Đổi mật khẩu'}
              </button>
            </div>

            {showPwd && (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Mật khẩu hiện tại', key: 'currentPassword' },
                  { label: 'Mật khẩu mới', key: 'newPassword' },
                  { label: 'Xác nhận mật khẩu mới', key: 'confirmPassword' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      required
                      type="password"
                      value={pwdForm[key]}
                      onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)',
                        color: '#f1f5f9', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
                {pwdForm.newPassword && pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: 12 }}>
                    <AlertCircle size={14}/> Mật khẩu xác nhận không khớp
                  </div>
                )}
                <button
                  type="submit"
                  disabled={pwdLoading}
                  style={{
                    padding: '10px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none', color: '#fff', cursor: 'pointer',
                    fontWeight: 700, fontSize: 14, alignSelf: 'flex-end',
                    paddingLeft: 24, paddingRight: 24
                  }}
                >
                  {pwdLoading ? 'Đang đổi...' : '🔒 Xác nhận đổi mật khẩu'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
