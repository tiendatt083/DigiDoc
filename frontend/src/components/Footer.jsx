import { BookOpen, Globe, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

const Footer = () => {
    const { user } = useAuthStore();

    return (
        <footer style={{
            background: '#ffffff',
            borderTop: '1px solid #dbe6f3',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 1,
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 36, marginBottom: 40 }}>
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 14 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 14,
                                background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 12px 24px rgba(37,99,235,0.18)',
                            }}>
                                <BookOpen size={18} color="#fff" />
                            </div>
                            <span className="gradient-text" style={{ fontWeight: 900, fontSize: 19, fontFamily: 'Space Grotesk, sans-serif' }}>DiGiDoc</span>
                        </Link>
                        <p style={{ color: '#526274', fontSize: 14, lineHeight: 1.75, maxWidth: 280 }}>
                            Kho tài liệu số dành cho học sinh, sinh viên và người đi làm muốn học nhanh, tra cứu dễ, mua tài liệu an toàn.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                            {[Globe, MessageCircle, Mail].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 14,
                                        background: '#f3f7fd',
                                        border: '1px solid #dbe6f3',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#2563eb',
                                        transition: 'all 0.2s',
                                        textDecoration: 'none',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = '#e8f1ff';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = '#f3f7fd';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: '#132033', fontWeight: 900, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0 }}>Khám Phá</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
                            {[['Trang Chủ', '/'], ['Trang Sản Phẩm', '/documents'], ['Blogs', '/blog']].map(([label, to]) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        style={{ color: '#526274', fontSize: 14, fontWeight: 650, textDecoration: 'none', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#526274'}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: '#132033', fontWeight: 900, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0 }}>Hỗ Trợ</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
                            {['Câu Hỏi Thường Gặp', 'Liên Hệ', 'Điều Khoản Dịch Vụ'].map(label => (
                                <li key={label}>
                                    <span style={{ color: '#526274', fontSize: 14, fontWeight: 650 }}>{label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: '#132033', fontWeight: 900, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0 }}>Cập Nhật Mới Nhất</h4>
                        <p style={{ color: '#526274', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                            Nhận thông báo khi có tài liệu mới, voucher và bài viết học tập hữu ích.
                        </p>
                        {!user && (
                            <Link to="/register" className="btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
                                Đăng Ký Ngay
                            </Link>
                        )}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #edf2f8', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ color: '#8a9aac', fontSize: 13 }}>© {new Date().getFullYear()} DiGiDoc. Tất cả quyền được bảo lưu.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['Bảo Mật', 'Cookie', 'DMCA'].map(label => (
                            <span key={label} style={{ color: '#526274', fontSize: 12, padding: '5px 11px', background: '#f3f7fd', borderRadius: 999, border: '1px solid #e4edf7' }}>{label}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
