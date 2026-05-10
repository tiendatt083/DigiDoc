import { Link } from 'react-router-dom';
import { getUploadUrl } from '../config/env';
import { ArrowRight, BookOpen, Zap, ShieldCheck, Star, Users, Download, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const StatItem = ({ value, label, icon: Icon }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg,#a5b4fc,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {value}
        </div>
        <div style={{ color: '#64748b', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Icon size={13} /> {label}
        </div>
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
    <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
        <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
            border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color
        }}>
            <Icon size={24} />
        </div>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', marginBottom: 8 }}>{title}</h3>
        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
    </div>
);

const HomePage = () => {
    const { user } = useAuthStore();
    const [featuredDocs, setFeaturedDocs] = useState([]);
    const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

    useEffect(() => {
        api.get('/documents').then(r => setFeaturedDocs((r.data || []).slice(0, 4))).catch(() => {});
    }, []);

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>

            {/* ── HERO ── */}
            <section style={{ paddingTop: 100, paddingBottom: 80, textAlign: 'center', position: 'relative' }}>
                {/* decorative orbs */}
                <div style={{
                    position: 'absolute', top: '10%', left: '10%',
                    width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', top: '20%', right: '8%',
                    width: 250, height: 250,
                    background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none'
                }} />

                <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
                    {/* badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                        <span className="pill pill-indigo">
                            <Star size={11} fill="currentColor" /> Nền tảng học liệu số #1 Việt Nam
                        </span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(36px, 6vw, 70px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px' }}>
                        Tài Liệu Học Tập<br />
                        <span className="gradient-text">Chất Lượng Cao</span><br />
                        Cho Mọi Cấp Học
                    </h1>

                    <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.75 }}>
                        Hàng nghìn tài liệu ôn tập, đề thi, giáo trình từ các giảng viên hàng đầu.
                        Tải ngay — học thật nhanh.
                    </p>

                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/documents" className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
                            Khám Phá Tài Liệu <ArrowRight size={18} />
                        </Link>
                        {!user && (
                            <Link to="/register" className="btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }}>
                                Đăng Ký Miễn Phí
                            </Link>
                        )}
                    </div>

                    {/* Stats row */}
                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: 48,
                        marginTop: 56, paddingTop: 40,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        flexWrap: 'wrap'
                    }}>
                        <StatItem value="5,000+" label="Tài liệu" icon={BookOpen} />
                        <StatItem value="12,000+" label="Học viên" icon={Users} />
                        <StatItem value="98%" label="Hài lòng" icon={Star} />
                        <StatItem value="24/7" label="Truy cập" icon={Download} />
                    </div>
                </div>
            </section>

            {/* ── FEATURED DOCS ── */}
            {featuredDocs.length > 0 && (
                <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                        <div>
                            <p className="pill pill-indigo" style={{ marginBottom: 10, display: 'inline-flex' }}>
                                <TrendingUp size={11} /> Nổi bật tuần này
                            </p>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Tài Liệu Được Yêu Thích</h2>
                        </div>
                        <Link to="/documents" style={{ color: '#6366f1', fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Xem tất cả <ArrowRight size={15} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                        {featuredDocs.map(doc => (
                            <Link to={`/documents/${doc.slug}`} key={doc.id} className="product-card">
                                <div className="card-thumb" style={{ height: 170, background: '#131330' }}>
                                    {doc.thumbnailPath ? (
                                        <img src={(getUploadUrl(doc.thumbnailPath) || "")} alt={doc.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BookOpen size={40} color="#2d2d6b" />
                                        </div>
                                    )}
                                    {doc.salePrice && (
                                        <div style={{
                                            position: 'absolute', top: 10, left: 10,
                                            background: 'linear-gradient(135deg,#ef4444,#ec4899)',
                                            color: '#fff', fontSize: 10, fontWeight: 800,
                                            padding: '3px 8px', borderRadius: 6
                                        }}>SALE</div>
                                    )}
                                    {doc.categoryName && (
                                        <div style={{
                                            position: 'absolute', top: 10, right: 10,
                                            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                                            color: '#a5b4fc', fontSize: 10, fontWeight: 600,
                                            padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.3)'
                                        }}>{doc.categoryName}</div>
                                    )}
                                </div>
                                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {doc.title}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {doc.shortDescription || 'Tài liệu học tập chất lượng cao'}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            {doc.salePrice ? (
                                                <>
                                                    <span style={{ color: '#f87171', fontWeight: 800, fontSize: 15 }}>{formatPrice(doc.salePrice)}</span>
                                                    <span style={{ color: '#475569', fontSize: 11, textDecoration: 'line-through', marginLeft: 6 }}>{formatPrice(doc.price)}</span>
                                                </>
                                            ) : (
                                                <span style={{ color: '#a5b4fc', fontWeight: 800, fontSize: 15 }}>{formatPrice(doc.price)}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#fbbf24', fontSize: 11 }}>
                                            {'★'.repeat(Math.round(doc.averageRating || 4))}
                                            <span style={{ color: '#64748b', marginLeft: 3 }}>({doc.averageRating?.toFixed(1) || '4.0'})</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── FEATURES ── */}
            <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Tại Sao Chọn <span className="gradient-text">StudyDoc</span>?</h2>
                    <p style={{ color: '#64748b', marginTop: 10, fontSize: 15 }}>Được hàng nghìn học sinh, sinh viên tin dùng mỗi ngày</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                    <FeatureCard icon={Zap} color="#6366f1" title="Tải Ngay Lập Tức" desc="Truy cập tài liệu ngay sau khi thanh toán. Không cần chờ đợi hay xét duyệt." />
                    <FeatureCard icon={ShieldCheck} color="#10b981" title="Thanh Toán An Toàn" desc="Thanh toán qua QR ngân hàng, bảo mật tuyệt đối với mã xác nhận tự động." />
                    <FeatureCard icon={BookOpen} color="#06b6d4" title="Nội Dung Chất Lượng" desc="Tài liệu được kiểm duyệt bởi đội ngũ chuyên môn trước khi đăng bán." />
                    <FeatureCard icon={Star} color="#f59e0b" title="Tích Điểm Thưởng" desc="Mua tài liệu và tích lũy điểm thưởng để nhận ưu đãi ở những lần mua tiếp theo." />
                </div>
            </section>

            {/* ── CTA ── */}
            {!user && (
                <section style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{
                        maxWidth: 680, margin: '0 auto',
                        padding: '48px 40px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.06))',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: 24,
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: -60, right: -60,
                            width: 200, height: 200,
                            background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
                            borderRadius: '50%'
                        }} />
                        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
                            Bắt Đầu Học Tập <span className="gradient-text">Thông Minh Hơn</span> Ngay Hôm Nay
                        </h2>
                        <p style={{ color: '#94a3b8', marginBottom: 28, fontSize: 15 }}>
                            Tạo tài khoản miễn phí và khám phá hàng nghìn tài liệu học tập chất lượng.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn-primary">Đăng Ký Miễn Phí <ArrowRight size={16} /></Link>
                            <Link to="/documents" className="btn-secondary">Xem Tài Liệu</Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;
