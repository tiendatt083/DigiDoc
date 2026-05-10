import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-react';
import api from '../../api/axios';
import { showToast } from '../../utils/toast';

// Slug helper
const toSlug = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    api.get('/categories')
      .then(res => setCategories(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setShowModal(true);
  };

  const handleNameChange = (name) => {
    setForm(f => ({ ...f, name, slug: editing ? f.slug : toSlug(name) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form);
        showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        await api.post('/admin/categories', form);
        showToast('Thêm danh mục thành công!', 'success');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Xoá danh mục "${cat.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await api.delete(`/admin/categories/${cat.id}`);
      showToast('Đã xoá danh mục.', 'success');
      fetchCategories();
    } catch {
      showToast('Không thể xoá. Danh mục có thể đang được dùng.', 'error');
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>🏷️ Quản lý danh mục</h1>
          <p>Thêm, sửa, xoá danh mục tài liệu</p>
        </div>
        <button className="btn-admin-primary" onClick={openCreate}>
          <Plus size={16}/> Thêm danh mục
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading"><div className="spinner"/><p>Đang tải...</p></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Mô tả</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    <Tag size={36} style={{ marginBottom: 8, opacity: 0.3 }}/><br/>
                    Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
                  </td>
                </tr>
              ) : categories.map((cat, idx) => (
                <tr key={cat.id}>
                  <td style={{ color: '#64748b' }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(99,102,241,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#a5b4fc', flexShrink: 0
                      }}>
                        <Tag size={16}/>
                      </div>
                      <strong style={{ color: '#f1f5f9' }}>{cat.name}</strong>
                    </div>
                  </td>
                  <td><code>{cat.slug}</code></td>
                  <td style={{ color: '#64748b', maxWidth: 200 }}>
                    {cat.description ? (
                      <span title={cat.description}>
                        {cat.description.length > 50
                          ? cat.description.slice(0, 50) + '...'
                          : cat.description}
                      </span>
                    ) : <span style={{ opacity: 0.4 }}>—</span>}
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>
                    {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" title="Sửa" onClick={() => openEdit(cat)}>
                        <Pencil size={14}/>
                      </button>
                      <button className="btn-icon delete" title="Xoá" onClick={() => handleDelete(cat)}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={16}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tài liệu Toán học"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-row">
                <label>Slug (URL)</label>
                <input
                  type="text"
                  placeholder="tai-lieu-toan-hoc"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                />
                <small style={{ color: '#64748b', fontSize: 11 }}>
                  Tự động sinh từ tên. Có thể chỉnh thủ công.
                </small>
              </div>
              <div className="form-row">
                <label>Mô tả</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả ngắn về danh mục..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Huỷ
                </button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
