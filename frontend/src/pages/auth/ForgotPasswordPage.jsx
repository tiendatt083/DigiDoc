import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(''); setMessage(''); setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(''); setMessage(''); setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otpCode: otp });
            setMessage('OTP hợp lệ. Vui lòng nhập mật khẩu mới.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'OTP không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(''); setMessage(''); setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { email, otpCode: otp, newPassword });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <KeyRound size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800">Quên mật khẩu</h2>
                    <p className="mt-2 text-slate-600">
                        Lấy lại quyền truy cập vào tài khoản của bạn
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 border border-green-200">
                        {message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 border"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mã OTP (6 số)</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="6"
                                className="block w-full text-center tracking-widest text-2xl rounded-lg border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 border"
                                placeholder="------"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors disabled:opacity-50"
                        >
                            Xác nhận OTP <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 border"
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1">
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
