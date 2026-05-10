import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trash2, MessageSquare, Eye, EyeOff, Star } from 'lucide-react';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      alert('Đã xóa đánh giá');
    } catch (err) {
      alert('Lỗi khi xóa đánh giá');
    }
  };

  const handleToggleHide = async (id) => {
    try {
      const res = await api.put(`/admin/reviews/${id}/toggle-hide`);
      setReviews(reviews.map(r => r.id === id ? { ...r, isHidden: res.data.isHidden } : r));
    } catch (err) {
      alert('Lỗi thao tác');
    }
  };

  const submitReply = async (id) => {
    if (!replyText[id]) return;
    try {
      await api.put(`/admin/reviews/${id}/reply`, { adminReply: replyText[id] });
      setReviews(reviews.map(r => r.id === id ? { ...r, adminReply: replyText[id] } : r));
      setReplyingTo(null);
      alert('Đã trả lời đánh giá');
    } catch (err) {
      alert('Lỗi khi trả lời');
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Quản lý đánh giá</h2>
          <p>Xem, ẩn, xóa và trả lời đánh giá của khách hàng</p>
        </div>
      </div>

      <div className="admin-table-container">
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Chưa có đánh giá nào.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Đánh giá</th>
                <th>Phản hồi</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="font-semibold text-slate-800">{r.user?.fullName}</div>
                    <div className="text-xs text-slate-500">{r.user?.email}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-indigo-600 truncate max-w-[200px]">{r.document?.title}</div>
                  </td>
                  <td>
                    <div className="flex items-center text-amber-500 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-slate-300"} />
                      ))}
                    </div>
                    <div className="text-sm text-slate-700 italic">"{r.comment}"</div>
                  </td>
                  <td>
                    {replyingTo === r.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea 
                          value={replyText[r.id] || r.adminReply || ''} 
                          onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                          className="text-sm border border-slate-300 rounded p-2"
                          rows={2}
                          placeholder="Nhập phản hồi..."
                        />
                        <div className="flex gap-2">
                          <button onClick={() => submitReply(r.id)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded">Gửi</button>
                          <button onClick={() => setReplyingTo(null)} className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        {r.adminReply ? (
                          <div className="text-slate-600">
                            <span className="font-semibold text-indigo-600">Admin: </span>{r.adminReply}
                            <button onClick={() => setReplyingTo(r.id)} className="ml-2 text-indigo-600 text-xs underline">Sửa</button>
                          </div>
                        ) : (
                          <button onClick={() => setReplyingTo(r.id)} className="text-indigo-600 text-sm flex items-center gap-1 hover:underline">
                            <MessageSquare size={14} /> Trả lời
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${r.isHidden ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {r.isHidden ? 'Đã ẩn' : 'Hiển thị'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleHide(r.id)} 
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                        title={r.isHidden ? "Hiển thị" : "Ẩn"}
                      >
                        {r.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)} 
                        className="p-1.5 rounded hover:bg-rose-100 text-rose-600"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
