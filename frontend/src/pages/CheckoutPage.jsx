import { useState, useEffect } from 'react';
import { getUploadUrl } from '../config/env';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import api from '../api/axios';
import { CheckCircle, Gift, Tag } from 'lucide-react';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const CheckoutPage = () => {
    const { items, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [usePoints, setUsePoints] = useState(false);

    // Đọc các item đã chọn + voucher từ sessionStorage (CartPage đã lưu)
    const [selectedItemIds] = useState(() => {
        try { return new Set(JSON.parse(sessionStorage.getItem('selectedCartItemIds') || '[]')); }
        catch { return new Set(); }
    });
    const [appliedVoucher] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('appliedVoucher') || 'null'); }
        catch { return null; }
    });

    const selectedItems = items.filter(i => selectedItemIds.has(i.id));

    const subtotal = selectedItems.reduce((acc, item) => {
        const price = item.document.salePrice || item.document.price;
        return acc + (price * item.quantity);
    }, 0);

    const voucherDiscount = appliedVoucher?.discountAmount || 0;
    const afterVoucher = Math.max(0, subtotal - voucherDiscount);

    const requiredPoints = afterVoucher / 1000;
    const canUsePoints = user?.rewardPoints >= requiredPoints && afterVoucher > 0;
    const finalTotal = usePoints ? 0 : afterVoucher;

    const handleCreateOrder = async () => {
        if (selectedItems.length === 0) { alert('Không có sản phẩm nào được chọn.'); return; }
        setLoading(true);
        try {
            const body = {
                useRewardPoints: usePoints ? 1 : 0,
                voucherCode: appliedVoucher?.code || null,
                cartItemIds: [...selectedItemIds],
            };
            const res = await api.post('/orders/create', body);
            // Xóa sessionStorage
            sessionStorage.removeItem('selectedCartItemIds');
            sessionStorage.removeItem('appliedVoucher');

            if (res.data.status === 'PAID' || res.data.finalAmount === 0) {
                clearCart();
                navigate('/my-downloads');
            } else {
                await api.post(`/payments/create?orderCode=${res.data.orderCode}&paymentMethod=SEPAY`);
                clearCart();
                navigate(`/payment/${res.data.orderCode}`);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Lỗi tạo đơn hàng. Vui lòng thử lại.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 || selectedItems.length === 0) {
        return <div className="text-center py-20 text-slate-500">Không có sản phẩm nào được chọn. <a href="/cart" className="text-indigo-600 underline">Quay lại giỏ hàng</a></div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Xác nhận Thanh Toán</h1>

            {/* Selected items summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
                <h2 className="text-xl font-semibold mb-4">Sản phẩm đã chọn ({selectedItems.length})</h2>
                <div className="space-y-3">
                    {selectedItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                            <div className="flex items-center gap-3">
                                {item.document.thumbnailPath && (
                                    <img src={(getUploadUrl(item.document.thumbnailPath) || "")} className="w-10 h-10 rounded object-cover" />
                                )}
                                <span className="text-sm font-medium text-slate-800">{item.document.title} <span className="text-slate-400">× {item.quantity}</span></span>
                            </div>
                            <span className="font-semibold text-slate-700">{formatPrice((item.document.salePrice || item.document.price) * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                {/* Price breakdown */}
                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                        <span>Tạm tính</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    {voucherDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                            <span className="flex items-center gap-1"><Tag size={13}/> Mã {appliedVoucher?.code}</span>
                            <span>-{formatPrice(voucherDiscount)}</span>
                        </div>
                    )}
                    {usePoints && (
                        <div className="flex justify-between text-indigo-600 font-semibold">
                            <span>Điểm thưởng ({requiredPoints} điểm)</span>
                            <span>-{formatPrice(afterVoucher)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Tổng thanh toán</span>
                        <span className="text-indigo-600">{formatPrice(finalTotal)}</span>
                    </div>
                </div>
            </div>

            {/* Reward points */}
            {afterVoucher > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Gift size={24} className="text-indigo-600" /> Thanh toán bằng điểm thưởng
                    </h2>
                    <p className="text-slate-600 mb-4 text-sm">
                        Bạn đang có <strong>{user?.rewardPoints || 0} điểm</strong>.
                        Đơn hàng này cần <strong>{requiredPoints} điểm</strong> để thanh toán toàn bộ.
                    </p>
                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${canUsePoints ? (usePoints ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50') : 'border-slate-200 opacity-50 cursor-not-allowed'}`}>
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                            checked={usePoints}
                            onChange={(e) => setUsePoints(e.target.checked)}
                            disabled={!canUsePoints}
                        />
                        <div>
                            <div className="font-semibold text-slate-800">Dùng {requiredPoints} điểm để thanh toán 100% hóa đơn</div>
                            {!canUsePoints && <div className="text-xs text-rose-500 mt-1">Bạn không đủ điểm để thanh toán hóa đơn này.</div>}
                        </div>
                    </label>
                </div>
            )}

            <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {loading ? 'Đang xử lý...' : finalTotal === 0 ? 'Nhận sản phẩm miễn phí' : 'Tiến hành thanh toán'} <CheckCircle size={20} />
            </button>
        </div>
    );
};

export default CheckoutPage;
