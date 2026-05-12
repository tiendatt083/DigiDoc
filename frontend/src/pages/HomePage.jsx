import { Link } from 'react-router-dom';
import { getUploadUrl } from '../config/env';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    Download,
    GraduationCap,
    MessageSquare,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const page = {
    maxWidth: 1200,
    margin: '0 auto',
    paddingLeft: 24,
    paddingRight: 24,
};

const sectionTitle = {
    fontSize: 30,
    fontWeight: 900,
    color: '#132033',
    margin: 0,
    lineHeight: 1.25,
};

const mutedText = {
    color: '#526274',
    lineHeight: 1.7,
};

const clamp = (lines) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
});

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
const formatDate = (str) => str ? new Date(str).toLocaleDateString('vi-VN') : '';

const StatItem = ({ value, label, icon: Icon, tone }) => (
    <div style={{
        background: '#ffffff',
        border: '1px solid #dbe6f3',
        borderRadius: 8,
        padding: '18px 20px',
        minWidth: 150,
        boxShadow: '0 12px 30px rgba(27,55,100,0.08)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: tone.bg,
                color: tone.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Icon size={17} />
            </span>
            <span style={{ color: '#8a9aac', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</span>
        </div>
        <div style={{ color: '#132033', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
);

const SectionHeader = ({ eyebrow, title, desc, actionTo, actionLabel, icon: Icon = Sparkles }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 18,
        marginBottom: 26,
        flexWrap: 'wrap',
    }}>
        <div>
            <span className="pill pill-indigo" style={{ marginBottom: 12 }}>
                <Icon size={12} /> {eyebrow}
            </span>
            <h2 style={sectionTitle}>{title}</h2>
            {desc && <p style={{ ...mutedText, marginTop: 8, maxWidth: 560 }}>{desc}</p>}
        </div>
        {actionTo && (
            <Link to={actionTo} className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13 }}>
                {actionLabel} <ArrowRight size={15} />
            </Link>
        )}
    </div>
);

const DocumentCard = ({ doc }) => {
    const price = doc.salePrice != null ? doc.salePrice : doc.price;

    return (
        <Link to={`/documents/${doc.slug}`} className="product-card">
            <div className="card-thumb" style={{ height: 176, background: '#eef6ff' }}>
                {doc.thumbnailPath ? (
                    <img src={getUploadUrl(doc.thumbnailPath) || ''} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93a4bb' }}>
                        <BookOpen size={42} />
                    </div>
                )}
                {doc.salePrice != null && (
                    <span style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: '#f43f5e',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 900,
                        padding: '4px 8px',
                        borderRadius: 6,
                    }}>
                        SALE
                    </span>
                )}
                {doc.categoryName && (
                    <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: '#ffffff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '4px 9px',
                        borderRadius: 6,
                    }}>
                        {doc.categoryName}
                    </span>
                )}
            </div>
            <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: '#132033', fontWeight: 900, fontSize: 15, lineHeight: 1.45, marginBottom: 8, ...clamp(2) }}>
                    {doc.title}
                </h3>
                <p style={{ color: '#526274', fontSize: 13, lineHeight: 1.6, marginBottom: 16, flex: 1, ...clamp(2) }}>
                    {doc.shortDescription || 'Tài liệu học tập được biên soạn gọn, dễ đọc và dễ áp dụng.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                        <span style={{ color: doc.salePrice != null ? '#e11d48' : '#2563eb', fontWeight: 900, fontSize: 16 }}>
                            {formatPrice(price)}
                        </span>
                        {doc.salePrice != null && (
                            <span style={{ color: '#8a9aac', fontSize: 12, textDecoration: 'line-through', marginLeft: 6 }}>
                                {formatPrice(doc.price)}
                            </span>
                        )}
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={13} fill="currentColor" />
                        <span style={{ color: '#526274', fontWeight: 800 }}>{doc.averageRating?.toFixed(1) || '4.8'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, tone }) => (
    <article className="glass-card" style={{ padding: 22 }}>
        <div style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: tone.bg,
            color: tone.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        }}>
            <Icon size={22} />
        </div>
        <h3 style={{ color: '#132033', fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{title}</h3>
        <p style={{ ...mutedText, fontSize: 13, margin: 0 }}>{desc}</p>
    </article>
);

const BlogCard = ({ blog }) => (
    <Link to={`/blog/${blog.slug}`} className="glass-card" style={{ overflow: 'hidden', textDecoration: 'none', display: 'block' }}>
        {blog.thumbnail ? (
            <img src={blog.thumbnail} alt={blog.title} style={{ width: '100%', height: 178, objectFit: 'cover' }} />
        ) : (
            <div style={{
                height: 178,
                background: 'linear-gradient(135deg,#e8f1ff,#e8fbf5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
            }}>
                <BookOpen size={44} />
            </div>
        )}
        <div style={{ padding: 18 }}>
            <div style={{ color: '#8a9aac', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Calendar size={12} /> {formatDate(blog.createdAt)}
            </div>
            <h3 style={{ color: '#132033', fontSize: 17, lineHeight: 1.45, fontWeight: 900, margin: '0 0 10px', ...clamp(2) }}>
                {blog.title}
            </h3>
            <p style={{ color: '#526274', fontSize: 13, lineHeight: 1.65, margin: 0, ...clamp(3) }}>
                {blog.metaDescription || 'Bài viết chia sẻ kiến thức, tài nguyên và kinh nghiệm học tập từ DiGiDoc.'}
            </p>
        </div>
    </Link>
);

const ReviewCard = ({ review }) => (
    <article className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 12 }}>
            <div style={{ minWidth: 0 }}>
                <div style={{ color: '#132033', fontSize: 14, fontWeight: 900, ...clamp(1) }}>
                    {review.user?.fullName || 'Khách hàng DiGiDoc'}
                </div>
                {review.document?.slug ? (
                    <Link to={`/documents/${review.document.slug}`} style={{ color: '#2563eb', fontSize: 12, textDecoration: 'none', fontWeight: 700, ...clamp(1) }}>
                        {review.document.title}
                    </Link>
                ) : (
                    <div style={{ color: '#8a9aac', fontSize: 12 }}>Đánh giá tài liệu</div>
                )}
            </div>
            <div style={{ color: '#f59e0b', whiteSpace: 'nowrap', fontSize: 12 }}>
                {'★'.repeat(review.rating || 0)}
            </div>
        </div>
        <p style={{ color: '#526274', fontSize: 13, lineHeight: 1.7, margin: 0, ...clamp(4) }}>
            {review.comment || 'Khách hàng đã đánh giá tích cực về tài liệu này.'}
        </p>
        {review.adminReply && (
            <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#eef6ff', border: '1px solid #dbeafe' }}>
                <div style={{ color: '#1d4ed8', fontSize: 12, fontWeight: 900, marginBottom: 5 }}>Phản hồi từ DiGiDoc</div>
                <p style={{ color: '#526274', fontSize: 12, lineHeight: 1.6, margin: 0, ...clamp(3) }}>{review.adminReply}</p>
            </div>
        )}
    </article>
);

const HomePage = () => {
    const { user } = useAuthStore();
    const [featuredDocs, setFeaturedDocs] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewsExpanded, setReviewsExpanded] = useState(false);
    const visibleReviews = reviewsExpanded ? reviews : reviews.slice(0, 6);

    useEffect(() => {
        Promise.allSettled([
            api.get('/documents'),
            api.get('/blogs'),
            api.get('/reviews'),
        ]).then(([docsRes, blogsRes, reviewsRes]) => {
            if (docsRes.status === 'fulfilled') {
                setFeaturedDocs((docsRes.value.data || []).slice(0, 4));
            }
            if (blogsRes.status === 'fulfilled') {
                setBlogs((blogsRes.value.data || []).slice(0, 3));
            }
            if (reviewsRes.status === 'fulfilled') {
                setReviews(reviewsRes.value.data || []);
            }
        });
    }, []);

    return (
        <div>
            <section style={{
                background: 'linear-gradient(180deg,#ffffff 0%,#f6f9ff 62%,#eef6ff 100%)',
                borderBottom: '1px solid #dbe6f3',
            }}>
                <div style={{
                    ...page,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.02fr) minmax(340px,0.78fr)',
                    gap: 42,
                    alignItems: 'center',
                    paddingTop: 72,
                    paddingBottom: 70,
                }}>
                    <div>
                        <span className="pill pill-gold" style={{ marginBottom: 18 }}>
                            <GraduationCap size={13} /> Học nhanh hơn, chọn tài liệu đúng hơn
                        </span>
                        <h1 style={{
                            color: '#132033',
                            fontSize: 'clamp(38px, 5.4vw, 66px)',
                            lineHeight: 1.08,
                            fontWeight: 900,
                            margin: 0,
                            letterSpacing: 0,
                        }}>
                            Kho tài liệu số cho <span className="gradient-text">học tập và công việc</span>
                        </h1>
                        <p style={{ ...mutedText, fontSize: 18, maxWidth: 650, margin: '22px 0 30px' }}>
                            DiGiDoc giúp học sinh, sinh viên và người đi làm tìm tài liệu ôn tập, giáo trình, đề thi và mẫu biểu chuyên nghiệp trong vài thao tác.
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
                            <Link to="/documents" className="btn-primary" style={{ padding: '14px 26px' }}>
                                Khám phá tài liệu <ArrowRight size={18} />
                            </Link>
                            {!user && (
                                <Link to="/register" className="btn-secondary" style={{ padding: '14px 24px' }}>
                                    Tạo tài khoản miễn phí
                                </Link>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {['Tải ngay sau thanh toán', 'Có đánh giá thật', 'Tài liệu kiểm duyệt'].map(label => (
                                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#526274', fontSize: 13, fontWeight: 700 }}>
                                    <CheckCircle2 size={15} color="#16a34a" /> {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #dbe6f3',
                        borderRadius: 8,
                        padding: 22,
                        boxShadow: '0 24px 70px rgba(27,55,100,0.14)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid #dbe6f3', borderRadius: 8, marginBottom: 16, background: '#f8fbff' }}>
                            <Search size={17} color="#2563eb" />
                            <span style={{ color: '#8a9aac', fontSize: 13 }}>Tìm: đề thi, giáo trình, CV, kế toán...</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {(featuredDocs.length ? featuredDocs.slice(0, 4) : [
                                { title: 'Đề ôn tập học kỳ', categoryName: 'Ôn thi' },
                                { title: 'Mẫu báo cáo thực tập', categoryName: 'Đại học' },
                                { title: 'Bộ slide thuyết trình', categoryName: 'Kỹ năng' },
                                { title: 'Tài liệu công sở', categoryName: 'Đi làm' },
                            ]).map((item, index) => (
                                <div key={item.id || item.title} style={{
                                    minHeight: 118,
                                    borderRadius: 8,
                                    border: '1px solid #dbe6f3',
                                    background: index % 2 === 0 ? '#eef6ff' : '#e8fbf5',
                                    padding: 14,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}>
                                    <BookOpen size={22} color={index % 2 === 0 ? '#2563eb' : '#0f766e'} />
                                    <div>
                                        <div style={{ color: '#132033', fontSize: 13, fontWeight: 900, lineHeight: 1.4, ...clamp(2) }}>{item.title}</div>
                                        <div style={{ color: '#526274', fontSize: 11, fontWeight: 700, marginTop: 4 }}>{item.categoryName || 'Tài liệu'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ ...page, paddingTop: 34 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                    <StatItem value="5K+" label="Tài liệu" icon={BookOpen} tone={{ bg: '#e8f1ff', color: '#2563eb' }} />
                    <StatItem value="12K+" label="Người học" icon={Users} tone={{ bg: '#e8fbf5', color: '#0f766e' }} />
                    <StatItem value="98%" label="Hài lòng" icon={Star} tone={{ bg: '#fff7e8', color: '#b45309' }} />
                    <StatItem value="24/7" label="Tải xuống" icon={Download} tone={{ bg: '#fff1f2', color: '#e11d48' }} />
                </div>
            </section>

            {featuredDocs.length > 0 && (
                <section style={{ ...page, paddingTop: 70 }}>
                    <SectionHeader
                        eyebrow="Nổi bật tuần này"
                        title="Tài liệu được quan tâm"
                        desc="Những tài liệu đang được người học xem và mua nhiều nhất."
                        actionTo="/documents"
                        actionLabel="Xem tất cả"
                        icon={TrendingUp}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 20 }}>
                        {featuredDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                    </div>
                </section>
            )}

            <section style={{ ...page, paddingTop: 72 }}>
                <SectionHeader
                    eyebrow="Lý do nên chọn"
                    title="Trải nghiệm mua tài liệu gọn và đáng tin"
                    desc="Giao diện, thanh toán và tải file được thiết kế cho người cần học nhanh, làm nhanh."
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 18 }}>
                    <FeatureCard icon={Zap} title="Tải ngay lập tức" desc="Sau thanh toán, tài liệu nằm trong tài khoản và có thể tải lại bất kỳ lúc nào." tone={{ bg: '#e8f1ff', color: '#2563eb' }} />
                    <FeatureCard icon={ShieldCheck} title="Thanh toán rõ ràng" desc="Theo dõi trạng thái đơn hàng, mã chuyển khoản và lịch sử mua trên cùng một tài khoản." tone={{ bg: '#e8fbf5', color: '#0f766e' }} />
                    <FeatureCard icon={BookOpen} title="Dễ tìm đúng tài liệu" desc="Bộ lọc, danh mục và mô tả ngắn giúp chọn nhanh thứ bạn cần trước khi mua." tone={{ bg: '#fff7e8', color: '#b45309' }} />
                    <FeatureCard icon={Star} title="Đánh giá minh bạch" desc="Người mua có thể đánh giá tài liệu để người sau lựa chọn tự tin hơn." tone={{ bg: '#fff1f2', color: '#e11d48' }} />
                </div>
            </section>

            {!user && (
                <section style={{ ...page, paddingTop: 72 }}>
                    <div style={{
                        background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
                        borderRadius: 8,
                        padding: '34px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 24,
                        flexWrap: 'wrap',
                        boxShadow: '0 24px 55px rgba(37,99,235,0.18)',
                    }}>
                        <div>
                            <h2 style={{ color: '#ffffff', fontSize: 28, fontWeight: 900, margin: 0 }}>Bắt đầu xây kho tài liệu của bạn</h2>
                            <p style={{ color: 'rgba(255,255,255,0.84)', margin: '8px 0 0', maxWidth: 620, lineHeight: 1.7 }}>
                                Tạo tài khoản để lưu đơn hàng, tải tài liệu và nhận điểm thưởng khi mua.
                            </p>
                        </div>
                        <Link to="/register" className="btn-primary" style={{ background: '#ffffff', color: '#1d4ed8', boxShadow: 'none' }}>
                            Đăng ký miễn phí <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>
            )}

            {(blogs.length > 0 || reviews.length > 0) && (
                <section style={{ ...page, paddingTop: 72, paddingBottom: 84 }}>
                    {blogs.length > 0 && (
                        <div style={{ marginBottom: 58 }}>
                            <SectionHeader
                                eyebrow="Blog DiGiDoc"
                                title="Bài viết mới nhất"
                                desc="Gợi ý học tập, tài nguyên và kinh nghiệm giúp bạn dùng tài liệu hiệu quả hơn."
                                actionTo="/blog"
                                actionLabel="Xem blog"
                                icon={BookOpen}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 20 }}>
                                {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
                            </div>
                        </div>
                    )}

                    {reviews.length > 0 && (
                        <div>
                            <SectionHeader
                                eyebrow="Phản hồi khách hàng"
                                title="Đánh giá của cửa hàng"
                                desc="Những nhận xét mới nhất từ người đã mua tài liệu trên DiGiDoc."
                                icon={MessageSquare}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
                                {visibleReviews.map(review => <ReviewCard key={review.id} review={review} />)}
                            </div>
                            {reviews.length > 6 && (
                                <div style={{ textAlign: 'center', marginTop: 22 }}>
                                    <button
                                        type="button"
                                        onClick={() => setReviewsExpanded(prev => !prev)}
                                        className="btn-secondary"
                                        style={{ padding: '10px 18px', fontSize: 13 }}
                                    >
                                        {reviewsExpanded ? 'Ẩn bớt' : `Hiển thị thêm ${reviews.length - 6} đánh giá`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default HomePage;
