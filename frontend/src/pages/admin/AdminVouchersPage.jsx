import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { adminGetAllVouchers, adminCreateVoucher, adminUpdateVoucher, adminDeleteVoucher } from '../../api/adminApi';

const EMPTY_FORM = {
  name: '', code: '', discountType: 'PERCENT', discountValue: '',
  minOrderAmount: '', maxDiscountAmount: '', usageLimit: '',
  startDate: '', endDate: '', status: 'ACTIVE'
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchVouchers = () => {
    setLoading(true);
    adminGetAllVouchers().then(res => setVouchers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVouchers(); }, []);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, code: item.code, discountType: item.discountType,
      discountValue: item.discountValue, minOrderAmount: item.minOrderAmount || '',
      maxDiscountAmount: item.maxDiscountAmount || '', usageLimit: item.usageLimit || '',
      startDate: item.startDate?.substring(0, 16) || '',
      endDate: item.endDate?.substring(0, 16) || '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) await adminUpdateVoucher(editItem.id, form);
      else await adminCreateVoucher(form);
      setShowModal(false);
      fetchVouchers();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xoá voucher "${name}"?`)) return;
    await adminDeleteVoucher(id);
    fetchVouchers();
  };

  const formatDate = (str) => str ? new Date(str).toLocaleDateString('vi-VN') : '—';
  const getVoucherDisplayStatus = (voucher) => {
    const now = new Date();
    const endDate = voucher.endDate ? new Date(voucher.endDate) : null;
    const usageLimit = voucher.usageLimit;
    const usedCount = voucher.usedCount || 0;

    if (voucher.status === 'INACTIVE') {
      return { label: 'Đã tắt', className: 'inactive' };
    }
    if (endDate && endDate < now) {
      return { label: 'Hết hạn', className: 'expired' };
    }
    if (usageLimit != null && usedCount >= usageLimit) {
      return { label: 'Hết lượt', className: 'used-up' };
    }
    if (voucher.status === 'EXPIRED') {
      return { label: 'Hết hạn', className: 'expired' };
    }
    return { label: 'Hoạt động', className: 'active' };
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Voucher</h1>
          <p>Tạo và quản lý các mã giảm giá</p>
        </div>
        <button className="btn-admin-primary" onClick={openCreate}>
          <Plus size={16}/> Thêm voucher
        </button>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner"/></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Tên</th><th>Mã</th><th>Loại giảm</th>
                <th>Giá trị</th><th>Đã dùng</th><th>Hết hạn</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr><td colSpan="9" className="empty-row">Chưa có voucher nào</td></tr>
              ) : vouchers.map((v, i) => {
                const displayStatus = getVoucherDisplayStatus(v);
                return (
                  <tr key={v.id}>
                    <td>{i + 1}</td>
                    <td>{v.name}</td>
                    <td><code className="voucher-code">{v.code}</code></td>
                    <td>{v.discountType === 'PERCENT' ? 'Phần trăm' : 'Số tiền cố định'}</td>
                    <td>{v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue?.toLocaleString('vi-VN')}₫`}</td>
                    <td>{v.usedCount || 0}/{v.usageLimit || '∞'}</td>
                    <td>{formatDate(v.endDate)}</td>
                    <td>
                      <span className={`status-badge ${displayStatus.className}`}>
                        {displayStatus.label}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon edit" onClick={() => openEdit(v)}><Pencil size={14}/></button>
                        <button className="btn-icon delete" onClick={() => handleDelete(v.id, v.name)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Sửa voucher' : 'Thêm voucher mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-row">
                  <label>Tên voucher *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Giảm 20% mùa hè"/>
                </div>
                <div className="form-row">
                  <label>Mã voucher *</label>
                  <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="VD: SUMMER20"/>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Loại giảm</label>
                  <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}>
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (₫)</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Giá trị *</label>
                  <input required type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} placeholder={form.discountType === 'PERCENT' ? '20' : '50000'}/>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Đơn tối thiểu (₫)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} placeholder="0"/>
                </div>
                <div className="form-row">
                  <label>Giảm tối đa (₫)</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={e => setForm({...form, maxDiscountAmount: e.target.value})} placeholder="Không giới hạn"/>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Ngày bắt đầu</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}/>
                </div>
                <div className="form-row">
                  <label>Ngày kết thúc</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}/>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Giới hạn sử dụng</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} placeholder="Không giới hạn"/>
                </div>
                <div className="form-row">
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tắt</option>
                  </select>
                </div>
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
