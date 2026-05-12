import { useEffect, useState } from 'react';
import { getUploadUrl } from '../config/env';
import { useCartStore } from '../context/cartStore';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, Tag, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import { toast } from '../utils/toast';

const CartPage = () => {
    const { items, loading, removeFromCart, updateQuantity, clearCart, fetchCart } = useCartStore();
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherResult, setVoucherResult] = useState(null); // { discountAmount, code, type }
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [voucherError, setVoucherError] = useState('');

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Khi items load xong, chọn tất cả mặc định
    useEffect(() => {
        if (items.length > 0) {
            setSelectedIds(new Set(items.map(i => i.id)));
        }
    }, [items]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const selectedItems = items.filter(i => selectedIds.has(i.id));

    const subtotal = selectedItems.reduce((acc, item) => {
        const price = (item.document?.salePrice != null ? item.document.salePrice : item.document?.price) || 0;
        return acc + (price * item.quantity);
    }, 0);

    const discount = voucherResult?.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        // Reset voucher khi đổi lựa chọn
        setVoucherResult(null);
        setVoucherError('');
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map(i => i.id)));
        }
        setVoucherResult(null);
        setVoucherError('');
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        if (subtotal === 0) { setVoucherError('Vui lòng chọn ít nhất một tài liệu.'); return; }
        setVoucherLoading(true);
        setVoucherError('');
        setVoucherResult(null);
        try {
            const res = await api.post('/vouchers/apply', { code: voucherCode.trim(), orderAmount: subtotal });
            setVoucherResult(res.data);
        } catch (err) {
            // Spring Boot trả về message trong nhiều dạng khác nhau
            const errMsg = err.response?.data?.message
                || err.response?.data?.error
                || (typeof err.response?.data === 'string' ? err.response.data : null)
                || 'Mã giảm giá không hợp lệ.';
            setVoucherError(errMsg);
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleCheckout = () => {
        if (selectedIds.size === 0) { toast.warning('Vui lòng chọn ít nhất một tài liệu để thanh toán.'); return; }
        // Lưu selectedItemIds và voucher vào sessionStorage để CheckoutPage đọc
        sessionStorage.setItem('selectedCartItemIds', JSON.stringify([...selectedIds]));
        sessionStorage.setItem('appliedVoucher', voucherResult ? JSON.stringify(voucherResult) : '');
        navigate('/checkout');
    };

    if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100">
                    <div className="mx-auto h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="h-10 w-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h2>
                    <p className="text-slate-500 mb-8">Bạn chưa thêm tài liệu nào vào giỏ hàng.</p>
                    <Link to="/documents" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                        Tiếp Tục Mua Sắm <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    const allSelected = selectedIds.size === items.length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Giỏ Hàng</h1>
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left — product list */}
                <div className="lg:w-2/3 flex flex-col gap-4">
                    {/* Select all bar */}
                    <div className="bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="select-all"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                        <label htmlFor="select-all" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                            Chọn tất cả ({items.length} tài liệu)
                        </label>
                        {selectedIds.size > 0 && selectedIds.size < items.length && (
                            <span className="ml-auto text-xs text-slate-500">Đã chọn {selectedIds.size}/{items.length}</span>
                        )}
                    </div>

                    {items.map((item) => {
                        const price = (item.document.salePrice != null ? item.document.salePrice : item.document.price);
                        const isSelected = selectedIds.has(item.id);
                        return (
                            <div key={item.id} className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border transition-all flex flex-col sm:flex-row gap-6 items-center ${isSelected ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-100'}`}>
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(item.id)}
                                    className="w-5 h-5 accent-indigo-600 cursor-pointer flex-shrink-0"
                                />
                                <div className="w-full sm:w-20 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.document.thumbnailPath ? (
                                        <img src={(getUploadUrl(item.document.thumbnailPath) || "")} alt={item.document.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Chưa có ảnh</div>
                                    )}
                                </div>
                                <div className="flex-grow flex flex-col items-start w-full">
                                    <Link to={`/documents/${item.document.slug}`} className="text-base font-bold text-slate-900 hover:text-indigo-600 mb-1">
                                        {item.document.title}
                                    </Link>
                                    <p className="text-sm text-slate-500 mb-2">{item.document.categoryName || 'Chưa phân loại'}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold text-indigo-700">{formatPrice(price)}</span>
                                        {item.document.salePrice != null && (
                                            <span className="text-sm text-slate-400 line-through">{formatPrice(item.document.price)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-4 sm:pt-0 border-slate-100">
                                    <div className="flex items-center border border-slate-200 rounded-md">
                                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-medium">-</button>
                                        <span className="px-3 py-1 font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-medium">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-md transition-colors" title="Xóa khỏi giỏ hàng">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-end mt-2">
                        <button onClick={clearCart} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                            Xóa tất cả giỏ hàng
                        </button>
                    </div>
                </div>

                {/* Right — summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24 space-y-5">
                        <h2 className="text-xl font-bold text-slate-900">Tóm Tắt Đơn Hàng</h2>

                        {/* Voucher */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Tag size={14} className="text-indigo-500" /> Mã giảm giá
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucherResult(null); setVoucherError(''); }}
                                    placeholder="Nhập mã voucher..."
                                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase"
                                    onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                                />
                                <button
                                    onClick={handleApplyVoucher}
                                    disabled={voucherLoading || !voucherCode.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {voucherLoading ? '...' : 'Áp dụng'}
                                </button>
                            </div>
                            {voucherError && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-rose-600">
                                    <XCircle size={13}/> {voucherError}
                                </div>
                            )}
                            {voucherResult && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 font-semibold">
                                    <CheckCircle size={13}/> Áp dụng thành công! Giảm {formatPrice(voucherResult.discountAmount)}
                                </div>
                            )}
                        </div>

                        {/* Price summary */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Đã chọn ({selectedIds.size} tài liệu)</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            {voucherResult && (
                                <div className="flex justify-between text-emerald-600 font-semibold">
                                    <span>Giảm giá ({voucherResult.code})</span>
                                    <span>-{formatPrice(discount)}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                                <span className="text-base font-bold text-slate-900">Tổng cộng</span>
                                <span className="text-2xl font-black text-indigo-600">{formatPrice(finalTotal)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={selectedIds.size === 0}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
                        >
                            Tiến Hành Thanh Toán <ArrowRight size={18} />
                        </button>
                        <div className="text-center text-xs text-slate-400">Thanh toán an toàn và tự động 24/7.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
