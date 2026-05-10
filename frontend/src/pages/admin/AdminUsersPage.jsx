import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { adminGetAllUsers, adminUpdateUser, adminDeleteUser } from '../../api/adminApi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', isActive: true, role: 'ROLE_USER' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminGetAllUsers()
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      isActive: user.isActive ?? true,
      role: user.role || 'ROLE_USER'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateUser(editUser.id, form);
      setShowModal(false);
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Xoá tài khoản "${email}"?`)) return;
    await adminDeleteUser(id);
    fetchUsers();
  };

  const formatDate = (str) => str ? new Date(str).toLocaleDateString('vi-VN') : '—';

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>👥 Quản lý người dùng</h1>
          <p>Tất cả tài khoản người dùng trong hệ thống</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner"/></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Họ tên</th><th>Email</th><th>SĐT</th>
                <th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id}>
                  <td>{i + 1}</td>
                  <td>{user.fullName || '—'}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || '—'}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
                      {user.role === 'ROLE_ADMIN' ? '🛡️ Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Hoạt động' : 'Bị khoá'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" onClick={() => openEdit(user)}><Pencil size={14}/></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(user.id, user.email)}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Sửa người dùng</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <label>Họ và tên</label>
                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Nhập họ tên..."/>
              </div>
              <div className="form-row">
                <label>Số điện thoại</label>
                <input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="0xxxxxxxxx"/>
              </div>
              <div className="form-row">
                <label>Vai trò</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-row">
                <label>Trạng thái</label>
                <select value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value === 'true'})}>
                  <option value="true">Hoạt động</option>
                  <option value="false">Khoá tài khoản</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Huỷ</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : <><Check size={14}/> Lưu</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
