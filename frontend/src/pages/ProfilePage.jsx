import { useState, useEffect } from 'react';
import { AlertCircle, Award, Check, Download, Lock, Mail, Phone, ShoppingBag, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../context/authStore';
import { toast } from '../utils/toast';

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #dbe6f3',
  borderRadius: 8,
  boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
};

const fieldStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 8,
  fontSize: 14,
  background: '#ffffff',
  border: '1px solid #dbe6f3',
  color: '#132033',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  color: '#526274',
  fontSize: 13,
  fontWeight: 800,
  display: 'block',
  marginBottom: 6,
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  async function fetchProfile() {
    try {
      const res = await api.get('/user/profile');
      setProfile(res.data);
      setProfileForm({ fullName: res.data.fullName || '', phoneNumber: res.data.phoneNumber || '' });
    } catch {
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrderCount() {
    try {
      const res = await api.get('/orders/my-orders');
      setOrderCount(res.data?.length || 0);
    } catch {
      // Không ảnh hưởng tới trang hồ sơ.
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchOrderCount();
  }, [user, navigate]);

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
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '42px 24px 78px' }}>
      <header style={{ marginBottom: 28 }}>
        <span className="pill pill-indigo" style={{ marginBottom: 12 }}>
          <User size={12}/> Tài khoản
        </span>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: '0 0 8px', color: '#132033', letterSpacing: 0 }}>
          Thông tin cá nhân
        </h1>
        <p style={{ color: '#526274', margin: 0, lineHeight: 1.7 }}>Quản lý hồ sơ, đơn hàng, tài liệu đã mua và bảo mật tài khoản.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22, alignItems: 'start' }}>
        <aside>
          <section style={{ ...cardStyle, padding: 26, textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: 8,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              color: '#fff',
              fontWeight: 900,
              boxShadow: '0 16px 32px rgba(37,99,235,0.18)',
            }}>
              {profile?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <p style={{ color: '#132033', fontWeight: 900, fontSize: 19, margin: 0 }}>{profile?.fullName}</p>
            <p style={{ color: '#2563eb', fontSize: 12, marginTop: 6, fontWeight: 800 }}>
              {profile?.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Thành viên'}
            </p>
            <p style={{ color: '#8a9aac', fontSize: 12, marginTop: 6 }}>{profile?.email}</p>
          </section>

          <section style={{ ...cardStyle, padding: 18 }}>
            <p style={{ color: '#526274', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', marginBottom: 14 }}>
              Tóm tắt tài khoản
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/my-orders" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, borderRadius: 8, background: '#eef6ff', textDecoration: 'none', border: '1px solid #dbeafe' }}>
                <span style={{ background: '#dbeafe', borderRadius: 8, padding: 9, color: '#2563eb' }}><ShoppingBag size={18}/></span>
                <div>
                  <p style={{ color: '#526274', fontSize: 11, margin: 0, fontWeight: 800 }}>Đơn hàng</p>
                  <p style={{ color: '#132033', fontWeight: 900, margin: 0 }}>{orderCount}</p>
                </div>
              </Link>
              <Link to="/my-downloads" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, borderRadius: 8, background: '#e8fbf5', textDecoration: 'none', border: '1px solid #b7eadc' }}>
                <span style={{ background: '#ccfbf1', borderRadius: 8, padding: 9, color: '#0f766e' }}><Download size={18}/></span>
                <div>
                  <p style={{ color: '#526274', fontSize: 11, margin: 0, fontWeight: 800 }}>Sản phẩm đã mua</p>
                  <p style={{ color: '#132033', fontWeight: 900, margin: 0 }}>Xem tài liệu</p>
                </div>
              </Link>
              <Link to="/my-points" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, borderRadius: 8, background: '#fff7e8', textDecoration: 'none', border: '1px solid #fed7aa' }}>
                <span style={{ background: '#ffedd5', borderRadius: 8, padding: 9, color: '#b45309' }}><Award size={18}/></span>
                <div>
                  <p style={{ color: '#526274', fontSize: 11, margin: 0, fontWeight: 800 }}>Điểm thưởng</p>
                  <p style={{ color: '#b45309', fontWeight: 900, margin: 0 }}>{profile?.rewardPoints || 0} điểm</p>
                </div>
              </Link>
            </div>
          </section>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <section style={{ ...cardStyle, padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
              <h2 style={{ color: '#132033', fontWeight: 900, fontSize: 19, margin: 0 }}>Thông tin cơ bản</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="btn-secondary" style={{ padding: '8px 15px', fontSize: 13 }}>
                  Chỉnh sửa
                </button>
              )}
            </div>

            {!editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: <User size={17}/>, label: 'Họ và tên', value: profile?.fullName },
                  { icon: <Mail size={17}/>, label: 'Email', value: profile?.email },
                  { icon: <Phone size={17}/>, label: 'Số điện thoại', value: profile?.phoneNumber || 'Chưa cập nhật' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#f8fbff', borderRadius: 8, border: '1px solid #dbe6f3' }}>
                    <span style={{ color: '#2563eb' }}>{icon}</span>
                    <div>
                      <p style={{ color: '#8a9aac', fontSize: 11, margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>{label}</p>
                      <p style={{ color: '#132033', fontWeight: 800, margin: 0, fontSize: 14 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Họ và tên *</label>
                  <input required value={profileForm.fullName} onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input value={profileForm.phoneNumber} onChange={e => setProfileForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="0xxxxxxxxx" style={fieldStyle} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setEditMode(false)} className="btn-secondary" style={{ padding: '9px 18px' }}>
                    Hủy
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '9px 18px' }}>
                    <Check size={15}/>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section style={{ ...cardStyle, padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: showPwd ? 22 : 0, flexWrap: 'wrap' }}>
              <h2 style={{ color: '#132033', fontWeight: 900, fontSize: 19, margin: 0 }}>Đổi mật khẩu</h2>
              <button onClick={() => setShowPwd(v => !v)} className={showPwd ? 'btn-secondary' : 'btn-primary'} style={{ padding: '8px 15px', fontSize: 13 }}>
                <Lock size={15}/>{showPwd ? 'Đóng' : 'Đổi mật khẩu'}
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
                    <label style={labelStyle}>{label}</label>
                    <input required type="password" value={pwdForm[key]} onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))} style={fieldStyle} />
                  </div>
                ))}
                {pwdForm.newPassword && pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e11d48', fontSize: 12, fontWeight: 800 }}>
                    <AlertCircle size={14}/> Mật khẩu xác nhận không khớp
                  </div>
                )}
                <button type="submit" disabled={pwdLoading} className="btn-primary" style={{ alignSelf: 'flex-end', padding: '10px 22px' }}>
                  {pwdLoading ? 'Đang đổi...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
