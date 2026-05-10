import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phoneNumber: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/auth/google', { idToken: credentialResponse.credential });
            login({ id: res.data.id, email: res.data.email, fullName: res.data.fullName, roles: res.data.roles }, res.data.token);
            navigate('/');
        } catch (err) {
            setError('Đăng nhập Google thất bại');
        }
    };

    const handleGoogleError = () => {
        setError('Đăng nhập Google thất bại');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có từ 6 ký tự trở lên.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Tạo Tài Khoản</h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Đăng nhập tại đây
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                            <p className="ml-3 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
                            <input name="fullName" type="text" required value={formData.fullName} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Địa Chỉ Email</label>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Số Điện Thoại (Tùy chọn)</label>
                            <input name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mật Khẩu</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors">
                        {loading ? 'Đang đăng ký...' : 'Tạo Tài Khoản'}
                    </button>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Hoặc tiếp tục với</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
