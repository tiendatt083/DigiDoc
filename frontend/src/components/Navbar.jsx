import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, BookOpen, Shield, ChevronDown, User, Download, Receipt } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useCartStore } from '../context/cartStore';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { items, fetchCart } = useCartStore();
    const navigate = useNavigate();
    const [dropOpen, setDropOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        if (user && !isAdmin) fetchCart();
    }, [user, isAdmin, fetchCart]);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

    const cartCount = items.reduce((a, i) => a + i.quantity, 0);

    const navLinks = isAdmin
        ? [
            { label: 'Trang Chủ', to: '/' },
            { label: 'Trang Sản Phẩm', to: '/documents' },
            { label: 'Blogs', to: '/blog' },
            { label: 'Bảng Điều Khiển', to: '/admin' },
        ]
        : [{ label: 'Trang Chủ', to: '/' }, { label: 'Sản Phẩm', to: '/documents' }, { label: 'Blog', to: '/blog' }];

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: scrolled ? 'rgba(8,8,24,0.92)' : 'rgba(8,8,24,0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none'
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

                {/* Logo + nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    <Link to="/" style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        textDecoration: 'none', fontWeight: 800, fontSize: 19,
                        fontFamily: 'Space Grotesk, sans-serif'
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
                        }}>
                            <BookOpen size={18} color="#fff" />
                        </div>
                        <span style={{ background: 'linear-gradient(135deg,#a5b4fc,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            DiGiDoc
                        </span>
                        {isAdmin && (
                            <span style={{ fontSize: 9, background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '2px 7px', borderRadius: 20, fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)', WebkitTextFillColor: '#818cf8' }}>ADMIN</span>
                        )}
                    </Link>

                    <div style={{ display: 'flex', gap: 4 }}>
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                color: '#94a3b8', textDecoration: 'none', transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Cart */}
                    {!isAdmin && user && (
                        <Link to="/cart" style={{ position: 'relative', padding: 8, borderRadius: 10, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', display: 'flex', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#a5b4fc'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            <ShoppingCart size={18} color="currentColor" />
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -4, right: -4,
                                    minWidth: 18, height: 18, borderRadius: 9,
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: '#fff', fontSize: 10, fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '0 4px'
                                }}>{cartCount}</span>
                            )}
                        </Link>
                    )}

                    {/* User menu or login */}
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setDropOpen(p => !p)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '7px 14px', borderRadius: 10,
                                    background: 'rgba(99,102,241,0.1)',
                                    border: '1px solid rgba(99,102,241,0.25)',
                                    color: '#a5b4fc', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: 24, height: 24, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                                </div>
                                {user.fullName?.split(' ').pop() || 'Tôi'}
                                <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>

                            {dropOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                        minWidth: 200,
                                        background: '#111128',
                                        border: '1px solid rgba(99,102,241,0.2)',
                                        borderRadius: 14, overflow: 'hidden',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                        zIndex: 50,
                                        animation: 'fadeInDown 0.15s ease'
                                    }}>
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{user.fullName || 'Người dùng'}</div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                                        </div>
                                        {!isAdmin && [
                                            { to: '/profile', label: 'Hồ Sơ', icon: User },
                                            { to: '/my-downloads', label: 'Tài Liệu Của Tôi', icon: Download },
                                            { to: '/my-orders', label: 'Đơn Hàng', icon: Receipt },
                                        ].map(({ to, label, icon: Icon }) => (
                                            <Link key={to} to={to} onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#cbd5e1', fontSize: 13, textDecoration: 'none', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Icon size={14} color="#6366f1" /> {label}
                                            </Link>
                                        ))}
                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#a5b4fc', fontSize: 13, textDecoration: 'none' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Shield size={14} /> Bảng Điều Khiển
                                            </Link>
                                        )}
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#f87171', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <LogOut size={14} /> Đăng Xuất
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link to="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: 13 }}>Đăng Nhập</Link>
                            <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Đăng Ký</Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
