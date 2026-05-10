import { BookOpen, Globe, MessageCircle, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer style={{
        background: 'rgba(8,8,24,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 'auto', position: 'relative', zIndex: 1
    }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 40, marginBottom: 48 }}>
                {/* Brand */}
                <div>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 14 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={16} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 17, background: 'linear-gradient(135deg,#a5b4fc,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Space Grotesk, sans-serif' }}>StudyDoc</span>
                    </Link>
                    <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>
                        Nền tảng tài liệu học tập số uy tín — cung cấp hàng nghìn tài liệu chất lượng cao cho học sinh, sinh viên.
                    </p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                        {[Globe, MessageCircle, PlayCircle].map((Icon, i) => (
                            <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', textDecoration: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                            >
                                <Icon size={15} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Explore */}
                <div>
                    <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Khám Phá</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[['Trang Chủ', '/'], ['Tất Cả Tài Liệu', '/documents'], ['Blog Học Tập', '/blog']].map(([label, to]) => (
                            <li key={to}><Link to={to} style={{ color: '#475569', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                            >{label}</Link></li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hỗ Trợ</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[['Câu Hỏi Thường Gặp', '/faq'], ['Liên Hệ', '/contact'], ['Điều Khoản Dịch Vụ', '/terms']].map(([label, to]) => (
                            <li key={to}><Link to={to} style={{ color: '#475569', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                            >{label}</Link></li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter teaser */}
                <div>
                    <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cập Nhật Mới Nhất</h4>
                    <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                        Nhận thông báo khi có tài liệu mới và ưu đãi độc quyền.
                    </p>
                    <Link to="/register" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 9,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: '#fff', fontWeight: 600, fontSize: 12,
                        textDecoration: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                    }}>
                        Đăng Ký Ngay
                    </Link>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <p style={{ color: '#334155', fontSize: 12 }}>© {new Date().getFullYear()} StudyDoc. Tất cả quyền được bảo lưu.</p>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['Bảo Mật', 'Cookie', 'DMCA'].map(label => (
                        <span key={label} style={{ color: '#334155', fontSize: 11, padding: '3px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>{label}</span>
                    ))}
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
