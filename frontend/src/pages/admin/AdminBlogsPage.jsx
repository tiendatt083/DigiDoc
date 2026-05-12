import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { adminGetAllBlogs, adminCreateBlog, adminUpdateBlog, adminDeleteBlog } from '../../api/adminApi';

const EMPTY_FORM = { title: '', slug: '', content: '', thumbnail: '', metaTitle: '', metaDescription: '', keywords: '', isPublished: true };

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchBlogs = () => {
    setLoading(true);
    adminGetAllBlogs()
      .then(res => setBlogs(res.data))
      .catch(err => setError(err.response?.data?.message || err.response?.data?.error || 'Không thể tải danh sách blog.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlogs(); }, []);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, slug: item.slug, content: item.content, thumbnail: item.thumbnail || '', metaTitle: item.metaTitle || '', metaDescription: item.metaDescription || '', keywords: item.keywords || '', isPublished: item.isPublished ?? true });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editItem) await adminUpdateBlog(editItem.id, form);
      else await adminCreateBlog(form);
      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Không thể lưu bài viết. Vui lòng kiểm tra lại nội dung.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xoá bài viết "${title}"?`)) return;
    await adminDeleteBlog(id);
    fetchBlogs();
  };

  const formatDate = (str) => str ? new Date(str).toLocaleDateString('vi-VN') : '—';

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>✍️ Quản lý Blog</h1>
          <p>Viết và quản lý các bài viết SEO</p>
        </div>
        <button className="btn-admin-primary" onClick={openCreate}>
          <Plus size={16}/> Viết bài mới
        </button>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner"/></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Tiêu đề</th><th>Slug</th>
                <th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr><td colSpan="6" className="empty-row">Chưa có bài viết nào</td></tr>
              ) : blogs.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td>{b.title}</td>
                  <td><code>{b.slug}</code></td>
                  <td>
                    <span className={`status-badge ${b.isPublished ? 'active' : 'inactive'}`}>
                      {b.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td>{formatDate(b.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" onClick={() => openEdit(b)}><Pencil size={14}/></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(b.id, b.title)}><Trash2 size={14}/></button>
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
          <div className="modal-box wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? '✏️ Sửa bài viết' : '➕ Viết bài mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="form-error">{error}</div>}
              <div className="form-row">
                <label>Tiêu đề *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Tiêu đề bài viết..."/>
              </div>
              <div className="form-row">
                <label>Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="tu-dong-tao-tu-tieu-de"/>
              </div>
              <div className="form-row">
                <label>Nội dung bài viết *</label>
                <textarea required rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Viết nội dung bài viết ở đây (hỗ trợ HTML)..."/>
              </div>
              <div className="form-row">
                <label>URL Ảnh thumbnail</label>
                <input value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})} placeholder="https://..."/>
              </div>
              <div className="form-row">
                <label>Meta Title (SEO)</label>
                <input value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} placeholder="Tiêu đề SEO..."/>
              </div>
              <div className="form-row">
                <label>Meta Description (SEO)</label>
                <textarea rows={2} value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} placeholder="Mô tả SEO..."/>
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Từ khoá (SEO)</label>
                  <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder="từ khoá 1, từ khoá 2..."/>
                </div>
                <div className="form-row">
                  <label>Trạng thái</label>
                  <select value={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.value === 'true'})}>
                    <option value="true">Xuất bản ngay</option>
                    <option value="false">Lưu nháp</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Huỷ</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : <><Check size={14}/> Lưu bài viết</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
