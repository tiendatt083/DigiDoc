import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import api from '../api/axios';
import { LogIn, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuthStore();
    const navigate = useNavigate();

    // Nếu đã đăng nhập rồi thì redirect ngay
    useEffect(() => {
        if (user) {
            if (user.roles?.includes('ROLE_ADMIN')) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/auth/google', { idToken: credentialResponse.credential });
            login({ id: res.data.id, email: res.data.email, fullName: res.data.fullName, roles: res.data.roles }, res.data.token);
            // Redirect theo role
            if (res.data.roles?.includes('ROLE_ADMIN')) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch {
            setError('Đăng nhập Google thất bại');
        }
    };

    const handleGoogleError = () => {
        setError('Đăng nhập Google thất bại');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', formData);
            login({ id: res.data.id, email: res.data.email, fullName: res.data.fullName, roles: res.data.roles }, res.data.token);
            // Admin → trang quản trị, User → trang chủ
            if (res.data.roles?.includes('ROLE_ADMIN')) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <LogIn className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Đăng Nhập</h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Đăng ký ngay
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
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="example@email.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mật Khẩu</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="••••••••" />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors">
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
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

export default LoginPage;
