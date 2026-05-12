import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, Download, LogOut, Receipt, ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../context/authStore';
import { useCartStore } from '../context/cartStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { items, fetchCart } = useCartStore();
    const navigate = useNavigate();
    const [dropOpen, setDropOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const navLinks = isAdmin
        ? [
            { label: 'Trang Chủ', to: '/' },
            { label: 'Trang Sản Phẩm', to: '/documents' },
            { label: 'Blogs', to: '/blog' },
            { label: 'Bảng Điều Khiển', to: '/admin' },
        ]
        : [
            { label: 'Trang Chủ', to: '/' },
            { label: 'Sản Phẩm', to: '/documents' },
            { label: 'Blog', to: '/blog' },
        ];

    useEffect(() => {
        if (user && !isAdmin) fetchCart();
    }, [user, isAdmin, fetchCart]);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropOpen(false);
    };

    const cartCount = items.reduce((a, i) => a + i.quantity, 0);

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(18px)',
            borderBottom: '1px solid rgba(219,230,243,0.9)',
            boxShadow: scrolled ? '0 14px 34px rgba(27,55,100,0.08)' : 'none',
            transition: 'all 0.25s ease',
        }}>
            <div style={{
                maxWidth: 1240,
                margin: '0 auto',
                padding: '0 24px',
                minHeight: 68,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32, minWidth: 0 }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                        fontWeight: 900,
                        fontSize: 20,
                        color: '#132033',
                        fontFamily: 'Space Grotesk, sans-serif',
                        whiteSpace: 'nowrap',
                    }}>
                        <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: 14,
                            background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 24px rgba(37,99,235,0.22)',
                        }}>
                            <BookOpen size={19} color="#fff" />
                        </div>
                        <span className="gradient-text">DiGiDoc</span>
                        {isAdmin && (
                            <span style={{
                                fontSize: 10,
                                background: '#e8f1ff',
                                color: '#1d4ed8',
                                padding: '3px 8px',
                                borderRadius: 999,
                                fontWeight: 800,
                                border: '1px solid #bfdbfe',
                            }}>
                                ADMIN
                            </span>
                        )}
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    padding: '9px 13px',
                                    borderRadius: 999,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: '#526274',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = '#1d4ed8';
                                    e.currentTarget.style.background = '#e8f1ff';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = '#526274';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {!isAdmin && user && (
                        <Link
                            to="/cart"
                            style={{
                                position: 'relative',
                                width: 42,
                                height: 42,
                                borderRadius: 14,
                                color: '#2563eb',
                                background: '#e8f1ff',
                                border: '1px solid #bfdbfe',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -6,
                                    minWidth: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    background: '#f43f5e',
                                    color: '#fff',
                                    fontSize: 11,
                                    fontWeight: 900,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 5px',
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setDropOpen(p => !p)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 9,
                                    padding: '7px 12px 7px 7px',
                                    borderRadius: 999,
                                    background: '#ffffff',
                                    border: '1px solid #dbe6f3',
                                    color: '#132033',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 800,
                                    boxShadow: '0 10px 24px rgba(27,55,100,0.08)',
                                }}
                            >
                                <div style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: 12,
                                    fontWeight: 900,
                                }}>
                                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                                </div>
                                {user.fullName?.split(' ').pop() || 'Tôi'}
                                <ChevronDown size={14} style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            {dropOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 10px)',
                                        right: 0,
                                        minWidth: 238,
                                        background: '#ffffff',
                                        border: '1px solid #dbe6f3',
                                        borderRadius: 18,
                                        overflow: 'hidden',
                                        boxShadow: '0 24px 60px rgba(27,55,100,0.16)',
                                        zIndex: 50,
                                    }}>
                                        <div style={{ padding: '16px 18px', borderBottom: '1px solid #edf2f8' }}>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: '#132033' }}>{user.fullName || 'Người dùng'}</div>
                                            <div style={{ fontSize: 12, color: '#8a9aac', marginTop: 3 }}>{user.email}</div>
                                        </div>
                                        {!isAdmin && [
                                            { to: '/profile', label: 'Hồ Sơ', icon: User },
                                            { to: '/my-downloads', label: 'Tài Liệu Của Tôi', icon: Download },
                                            { to: '/my-orders', label: 'Đơn Hàng', icon: Receipt },
                                        ].map(({ to, label, icon: Icon }) => (
                                            <Link
                                                key={to}
                                                to={to}
                                                onClick={() => setDropOpen(false)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    padding: '12px 18px',
                                                    color: '#526274',
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    textDecoration: 'none',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f3f7fd'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Icon size={15} color="#2563eb" /> {label}
                                            </Link>
                                        ))}
                                        <div style={{ borderTop: '1px solid #edf2f8' }}>
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    padding: '12px 18px',
                                                    color: '#e11d48',
                                                    fontSize: 14,
                                                    fontWeight: 800,
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <LogOut size={15} /> Đăng Xuất
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Link to="/login" className="btn-secondary" style={{ padding: '9px 18px', fontSize: 14 }}>Đăng Nhập</Link>
                            <Link to="/register" className="btn-primary" style={{ padding: '9px 18px', fontSize: 14 }}>Đăng Ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
