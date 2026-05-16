import { useState, useEffect } from 'react';
import { getUploadUrl } from '../../config/env';
import { RotateCcw, Trash2, Search, FileText, AlertTriangle } from 'lucide-react';
import { adminGetAllDocuments, adminRestoreDocument, adminDeleteDocument } from '../../api/adminApi';
import { toast } from '../../utils/toast';

const formatVND = (val) => {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export default function AdminTrashPage() {
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [restoring, setRestoring] = useState(null);

  const fetchDeleted = () => {
    setLoading(true);
    adminGetAllDocuments()
      .then(res => {
        const hidden = (res.data || []).filter(d => d.status === 'HIDDEN');
        setDeleted(hidden);
      })
      .catch(() => toast.error('Không thể tải danh sách'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeleted(); }, []);

  const handleRestore = async (doc) => {
    if (!window.confirm(`Khôi phục tài liệu "${doc.title}"?\nTài liệu sẽ hiển thị lại trên trang.`)) return;
    setRestoring(doc.id);
    try {
      await adminRestoreDocument(doc.id);
      setDeleted(prev => prev.filter(d => d.id !== doc.id));
      toast.success(`Đã khôi phục "${doc.title}"`);
    } catch {
      toast.error('Không thể khôi phục tài liệu');
    } finally {
      setRestoring(null);
    }
  };

  const filtered = deleted.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trash2 size={22} style={{ color: '#e11d48' }} />
            Thùng rác tài liệu
          </h1>
          <p>
            Tổng: <strong>{deleted.length}</strong> tài liệu đã xóa
            {' · '}
            <span style={{ color: '#64748b', fontSize: 13 }}>
              Khách đã mua vẫn tải về được
            </span>
          </p>
        </div>
      </div>

      {/* Banner thông tin */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
      }}>
        <AlertTriangle size={18} style={{ color: '#ca8a04', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          Đây là <strong>xóa mềm</strong> — tài liệu bị ẩn khỏi trang công khai nhưng vẫn còn trong cơ sở dữ liệu.
          Khách hàng đã mua <strong>vẫn tải về được</strong>. Bạn có thể khôi phục bất kỳ lúc nào.
        </p>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu đã xóa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: '#64748b', background: '#f8fafc',
          borderRadius: 12, border: '1px dashed #cbd5e1',
        }}>
          <Trash2 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 15 }}>
            {search ? 'Không tìm thấy tài liệu nào' : 'Thùng rác trống'}
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tài liệu</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Đã bán</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <tr key={doc.id} style={{ opacity: restoring === doc.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{ color: '#526274' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                        background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #fecaca',
                      }}>
                        {doc.thumbnailPath ? (
                          <img
                            src={getUploadUrl(doc.thumbnailPath) || ''}
                            alt={doc.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(40%)' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <FileText size={20} style={{ color: '#f87171' }} />
                        )}
                      </div>
                      <div>
                        <p style={{
                          color: '#132033', fontWeight: 700, margin: 0, fontSize: 13,
                          textDecoration: 'line-through', opacity: 0.6,
                        }}>{doc.title}</p>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: 11 }}>{doc.fileType || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#526274', fontSize: 13 }}>{doc.categoryName || '—'}</td>
                  <td>
                    {doc.salePrice != null && Number(doc.salePrice) < Number(doc.price) ? (
                      <>
                        <p style={{ color: '#e11d48', fontWeight: 800, margin: 0, fontSize: 13 }}>{formatVND(doc.salePrice)}</p>
                        <p style={{ color: '#8a9aac', margin: 0, fontSize: 11, textDecoration: 'line-through' }}>{formatVND(doc.price)}</p>
                      </>
                    ) : (
                      <p style={{ color: '#2563eb', fontWeight: 800, margin: 0, fontSize: 13 }}>{formatVND(doc.price)}</p>
                    )}
                  </td>
                  <td style={{ color: '#526274', textAlign: 'center' }}>{doc.totalSales || 0}</td>
                  <td>
                    <div className="action-btns" style={{ justifyContent: 'center' }}>
                      <button
                        className="btn-icon edit"
                        title="Khôi phục tài liệu"
                        onClick={() => handleRestore(doc)}
                        disabled={restoring === doc.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', width: 'auto' }}
                      >
                        <RotateCcw size={14} />
                        <span style={{ fontSize: 12 }}>Khôi phục</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
