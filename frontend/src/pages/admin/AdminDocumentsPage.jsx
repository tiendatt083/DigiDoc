import { useState, useEffect, useRef } from 'react';
import { getUploadUrl } from '../../config/env';
import { Plus, Pencil, Trash2, Search, X, Check, Eye, EyeOff, Image } from 'lucide-react';
import {
  adminGetAllDocuments, adminCreateDocument, adminUpdateDocument,
  adminDeleteDocument, getAllCategories
} from '../../api/adminApi';
import { toast } from '../../utils/toast';

const STATUSES = {
  ACTIVE: { label: 'Hiển thị', cls: 'active' },
  HIDDEN: { label: 'Ẩn', cls: 'inactive' },
};

/** Format số tiền sang VND có dấu phân cách */
const formatVND = (val) => {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
};

/** Ô nhập giá VND — dạng số nguyên, hiển thị có dấu chấm */
function PriceInput({ label, value, onChange, required }) {
  const [display, setDisplay] = useState(value ? String(value) : '');

  const handleChange = (e) => {
    // Chỉ giữ chữ số
    const raw = e.target.value.replace(/\D/g, '');
    setDisplay(raw);
    onChange(raw);
  };

  // Format khi blur
  const handleBlur = () => {
    if (display) {
      setDisplay(Number(display).toLocaleString('vi-VN'));
    }
  };
  // Khi focus: bỏ dấu chấm để dễ sửa
  const handleFocus = () => {
    setDisplay(display.replace(/\./g, '').replace(/,/g, ''));
  };

  // Sync khi value prop thay đổi (lúc open edit)
  useEffect(() => {
    setDisplay(value ? String(value) : '');
  }, [value]);

  return (
    <div className="form-row">
      <label>{label}{required ? ' *' : ''}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="0"
          required={required}
          style={{ paddingRight: 40 }}
        />
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          color: '#64748b', fontSize: 13, fontWeight: 600, pointerEvents: 'none'
        }}>₫</span>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  title: '', shortDescription: '', description: '',
  price: '', salePrice: '', categoryId: '', status: 'ACTIVE',
  file: null, thumbnail: null,
};

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [thumbPreview, setThumbPreview] = useState(null); // preview URL trong form

  const fetchData = () => {
    setLoading(true);
    Promise.all([adminGetAllDocuments(), getAllCategories()])
      .then(([docsRes, catsRes]) => {
        setDocuments(docsRes.data || []);
        setCategories(catsRes.data || []);
      })
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditDoc(null);
    setForm(EMPTY_FORM);
    setThumbPreview(null);
    setThumbPreview2(null);
    setThumbPreview3(null);
    setShowModal(true);
  };

  const openEdit = (doc) => {
    setEditDoc(doc);
    setForm({
      title: doc.title || '',
      shortDescription: doc.shortDescription || '',
      description: doc.description || '',
      price: doc.price ? String(doc.price) : '',
      salePrice: doc.salePrice ? String(doc.salePrice) : '',
      categoryId: doc.categoryId ? String(doc.categoryId) : '',
      status: doc.status || 'ACTIVE',
      file: null,
      thumbnail: null,
      thumbnail2: null,
      thumbnail3: null,
    });
    // Hiện ảnh cũ nếu có
    setThumbPreview(doc.thumbnailPath ? (getUploadUrl(doc.thumbnailPath) || "") : null);
    setThumbPreview2(doc.thumbnailPath2 ? (getUploadUrl(doc.thumbnailPath2) || "") : null);
    setThumbPreview3(doc.thumbnailPath3 ? (getUploadUrl(doc.thumbnailPath3) || "") : null);
    setShowModal(true);
  };

  const [thumbPreview2, setThumbPreview2] = useState(null);
  const [thumbPreview3, setThumbPreview3] = useState(null);

  const handleThumbnailChange = (e, field, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, [field]: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      // Append text fields
      ['title', 'shortDescription', 'description', 'price', 'salePrice', 'categoryId', 'status'].forEach(k => {
        if (form[k] !== '' && form[k] !== null && form[k] !== undefined) {
          // Xử lý giá: bỏ dấu chấm/phẩy trước khi gửi
          if (k === 'price' || k === 'salePrice') {
            const clean = String(form[k]).replace(/[.,]/g, '');
            if (clean) fd.append(k, clean);
          } else {
            fd.append(k, form[k]);
          }
        }
      });
      if (form.file) fd.append('file', form.file);
      if (form.thumbnail) fd.append('thumbnail', form.thumbnail);
      if (form.thumbnail2) fd.append('thumbnail2', form.thumbnail2);
      if (form.thumbnail3) fd.append('thumbnail3', form.thumbnail3);

      if (editDoc) {
        await adminUpdateDocument(editDoc.id, fd);
        toast.success('Cập nhật tài liệu thành công!');
      } else {
        await adminCreateDocument(fd);
        toast.success('Tạo tài liệu thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  /** Toggle nhanh ACTIVE <-> HIDDEN ngay trên bảng */
  const handleToggleStatus = async (doc) => {
    const newStatus = doc.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      await adminUpdateDocument(doc.id, fd);
      toast.success(`Đã chuyển sang "${newStatus === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}"`);
      fetchData();
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xoá tài liệu "${title}"? (Xoá mềm - tài liệu sẽ bị ẩn)`)) return;
    try {
      await adminDeleteDocument(id);
      toast.success('Đã xoá tài liệu');
      fetchData();
    } catch {
      toast.error('Không thể xoá tài liệu');
    }
  };

  const filtered = documents.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>📄 Quản lý tài liệu</h1>
          <p>Tổng: <strong>{documents.length}</strong> tài liệu ({documents.filter(d => d.status === 'ACTIVE').length} đang hiển thị)</p>
        </div>
        <button className="btn-admin-primary" onClick={openCreate}>
          <Plus size={16} /> Thêm tài liệu
        </button>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <Search size={16} />
        <input
          type="text" placeholder="Tìm kiếm theo tiêu đề..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading"><div className="spinner"/></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tài liệu</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    Chưa có tài liệu nào
                  </td>
                </tr>
              ) : filtered.map((doc, i) => (
                <tr key={doc.id}>
                  <td style={{ color: '#64748b' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                        background: 'rgba(99,102,241,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {doc.thumbnailPath ? (
                          <img
                            src={(getUploadUrl(doc.thumbnailPath) || "")}
                            alt={doc.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <span style={{ fontSize: 20, display: doc.thumbnailPath ? 'none' : 'flex' }}>📄</span>
                      </div>
                      <div>
                        <p style={{ color: '#f1f5f9', fontWeight: 600, margin: 0, fontSize: 13 }}>{doc.title}</p>
                        <p style={{ color: '#64748b', margin: 0, fontSize: 11 }}>{doc.fileType || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: 13 }}>{doc.categoryName || '—'}</td>
                  <td>
                    <div>
                      {doc.salePrice && Number(doc.salePrice) < Number(doc.price) ? (
                        <>
                          <p style={{ color: '#f87171', fontWeight: 700, margin: 0, fontSize: 13 }}>{formatVND(doc.salePrice)}</p>
                          <p style={{ color: '#64748b', margin: 0, fontSize: 11, textDecoration: 'line-through' }}>{formatVND(doc.price)}</p>
                        </>
                      ) : (
                        <p style={{ color: '#a5b4fc', fontWeight: 700, margin: 0, fontSize: 13 }}>{formatVND(doc.price)}</p>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', textAlign: 'center' }}>{doc.totalSales || 0}</td>
                  <td>
                    {/* Click để toggle trạng thái */}
                    <button
                      onClick={() => handleToggleStatus(doc)}
                      title="Click để thay đổi trạng thái"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <span className={`status-badge ${STATUSES[doc.status]?.cls || 'inactive'}`}
                        style={{ cursor: 'pointer' }}>
                        {doc.status === 'ACTIVE' ? <Eye size={12} style={{ marginRight: 4 }}/> : <EyeOff size={12} style={{ marginRight: 4 }}/>}
                        {STATUSES[doc.status]?.label || doc.status}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" title="Sửa" onClick={() => openEdit(doc)}>
                        <Pencil size={14}/>
                      </button>
                      <button className="btn-icon delete" title="Xoá" onClick={() => handleDelete(doc.id, doc.title)}>
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

      {/* Modal thêm / sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editDoc ? '✏️ Sửa tài liệu' : '➕ Thêm tài liệu mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Tiêu đề */}
              <div className="form-row">
                <label>Tiêu đề *</label>
                <input
                  required value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nhập tiêu đề tài liệu..."
                  autoFocus
                />
              </div>

              {/* Mô tả ngắn */}
              <div className="form-row">
                <label>Mô tả ngắn</label>
                <input
                  value={form.shortDescription}
                  onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                  placeholder="Tóm tắt ngắn về tài liệu..."
                />
              </div>

              {/* Mô tả chi tiết */}
              <div className="form-row">
                <label>Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Nội dung chi tiết, nêu rõ nội dung tài liệu..."
                />
              </div>

              {/* Giá */}
              <div className="form-row-2">
                <PriceInput
                  label="Giá gốc"
                  value={form.price}
                  onChange={v => setForm(f => ({ ...f, price: v }))}
                  required
                />
                <PriceInput
                  label="Giá khuyến mãi"
                  value={form.salePrice}
                  onChange={v => setForm(f => ({ ...f, salePrice: v }))}
                />
              </div>

              {/* Danh mục + Trạng thái */}
              <div className="form-row-2">
                <div className="form-row">
                  <label>Danh mục *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="ACTIVE">👁️ Hiển thị</option>
                    <option value="HIDDEN">🙈 Ẩn</option>
                  </select>
                </div>
              </div>

              {/* File tài liệu — chỉ bắt buộc khi tạo mới */}
              {!editDoc && (
                <div className="form-row">
                  <label>File tài liệu *</label>
                  <input
                    required type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))}
                  />
                  <small style={{ color: '#64748b', fontSize: 11 }}>Hỗ trợ: PDF, Word, Excel, PowerPoint</small>
                </div>
              )}

              {/* Thumbnails */}
              <div className="form-row">
                <label>Ảnh sản phẩm (Tối đa 3 ảnh)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  
                  {/* Image 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{
                      width: '100%', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden',
                      background: 'rgba(99,102,241,0.08)', border: '2px dashed rgba(99,102,241,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {thumbPreview ? (
                        <img src={thumbPreview} alt="preview 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : (
                        <Image size={24} style={{ color: '#6366f1', opacity: 0.4 }}/>
                      )}
                    </div>
                    <input type="file" accept="image/*" style={{ fontSize: 11 }} onChange={(e) => handleThumbnailChange(e, 'thumbnail', setThumbPreview)}/>
                    {thumbPreview && (
                      <button type="button" style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setThumbPreview(null); setForm(f => ({ ...f, thumbnail: null })); }}>✕ Xoá</button>
                    )}
                  </div>

                  {/* Image 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{
                      width: '100%', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden',
                      background: 'rgba(99,102,241,0.08)', border: '2px dashed rgba(99,102,241,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {thumbPreview2 ? (
                        <img src={thumbPreview2} alt="preview 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : (
                        <Image size={24} style={{ color: '#6366f1', opacity: 0.4 }}/>
                      )}
                    </div>
                    <input type="file" accept="image/*" style={{ fontSize: 11 }} onChange={(e) => handleThumbnailChange(e, 'thumbnail2', setThumbPreview2)}/>
                    {thumbPreview2 && (
                      <button type="button" style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setThumbPreview2(null); setForm(f => ({ ...f, thumbnail2: null })); }}>✕ Xoá</button>
                    )}
                  </div>

                  {/* Image 3 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{
                      width: '100%', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden',
                      background: 'rgba(99,102,241,0.08)', border: '2px dashed rgba(99,102,241,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {thumbPreview3 ? (
                        <img src={thumbPreview3} alt="preview 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : (
                        <Image size={24} style={{ color: '#6366f1', opacity: 0.4 }}/>
                      )}
                    </div>
                    <input type="file" accept="image/*" style={{ fontSize: 11 }} onChange={(e) => handleThumbnailChange(e, 'thumbnail3', setThumbPreview3)}/>
                    {thumbPreview3 && (
                      <button type="button" style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setThumbPreview3(null); setForm(f => ({ ...f, thumbnail3: null })); }}>✕ Xoá</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Huỷ</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : <><Check size={14}/> {editDoc ? 'Cập nhật' : 'Tạo tài liệu'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
