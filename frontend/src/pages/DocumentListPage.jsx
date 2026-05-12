import { useState, useEffect, useMemo } from 'react';
import { getUploadUrl } from '../config/env';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowUpDown, BookOpen, ChevronDown, Search, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import { toast } from '../utils/toast';

const clamp = (lines) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
});

const DocumentListPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const { addToCart } = useCartStore();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, catsRes] = await Promise.all([
                    api.get('/documents'),
                    api.get('/categories'),
                ]);
                setDocuments(docsRes.data || []);
                setCategories(catsRes.data || []);
            } catch (err) {
                console.error('Không thể tải dữ liệu', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredDocs = useMemo(() => {
        let result = documents.filter(doc => {
            const term = searchTerm.toLowerCase();
            const matchSearch = doc.title.toLowerCase().includes(term) ||
                (doc.categoryName && doc.categoryName.toLowerCase().includes(term));
            const matchCategory = selectedCategory === '' || doc.categoryName === selectedCategory;
            return matchSearch && matchCategory;
        });
        if (sortOrder === 'asc') {
            result = [...result].sort((a, b) => ((a.salePrice != null ? a.salePrice : a.price)) - ((b.salePrice != null ? b.salePrice : b.price)));
        } else if (sortOrder === 'desc') {
            result = [...result].sort((a, b) => ((b.salePrice != null ? b.salePrice : b.price)) - ((a.salePrice != null ? a.salePrice : a.price)));
        }
        return result;
    }, [documents, searchTerm, selectedCategory, sortOrder]);

    const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

    const handleAddToCart = (documentId) => {
        if (!user) {
            toast.warning('Vui lòng đăng nhập để thêm tài liệu vào giỏ hàng.');
            navigate('/login');
            return;
        }
        addToCart(documentId, 1);
    };

    const categoriesWithCount = [
        { id: '', name: 'Tất cả', count: documents.length },
        ...categories.map(c => ({ ...c, count: documents.filter(d => d.categoryName === c.name).length })),
    ];

    const SkeletonCard = () => (
        <div style={{ background: '#ffffff', border: '1px solid #dbe6f3', borderRadius: 8, overflow: 'hidden', boxShadow: '0 12px 30px rgba(27,55,100,0.08)' }}>
            <div className="skeleton" style={{ height: 180 }} />
            <div style={{ padding: 18 }}>
                <div className="skeleton" style={{ height: 16, marginBottom: 10, width: '82%' }} />
                <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '62%' }} />
                <div className="skeleton" style={{ height: 12, width: '42%' }} />
            </div>
        </div>
    );

    return (
        <div>
            <header style={{
                background: 'linear-gradient(180deg,#ffffff 0%,#eef6ff 100%)',
                borderBottom: '1px solid #dbe6f3',
                padding: '46px 24px 38px',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <span className="pill pill-indigo" style={{ marginBottom: 14 }}>
                        <BookOpen size={12} /> Kho tài liệu
                    </span>
                    <h1 style={{ fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 900, color: '#132033', margin: '0 0 10px', letterSpacing: 0 }}>
                        Khám phá <span className="gradient-text">tài liệu học tập</span>
                    </h1>
                    <p style={{ color: '#526274', fontSize: 16, lineHeight: 1.7, maxWidth: 680, margin: 0 }}>
                        {documents.length > 0
                            ? `${documents.length} tài liệu cho học sinh, sinh viên và người đi làm.`
                            : 'Tìm tài liệu phù hợp với mục tiêu học tập và công việc của bạn.'}
                    </p>
                </div>
            </header>

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px 76px' }}>
                <div style={{
                    background: '#ffffff',
                    border: '1px solid #dbe6f3',
                    borderRadius: 8,
                    padding: 18,
                    boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
                    marginBottom: 24,
                }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                            <input
                                type="text"
                                placeholder="Tìm theo tên tài liệu hoặc danh mục..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="input-dark"
                                style={{ paddingLeft: 42, height: 46 }}
                            />
                            <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a9aac' }} />
                        </div>
                        <div style={{ position: 'relative', minWidth: 190 }}>
                            <select
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: 46,
                                    appearance: 'none',
                                    background: '#ffffff',
                                    border: '1px solid #dbe6f3',
                                    borderRadius: 8,
                                    padding: '0 40px 0 40px',
                                    color: '#526274',
                                    fontSize: 13,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: 700,
                                }}
                            >
                                <option value="default">Mặc định</option>
                                <option value="asc">Giá: Thấp đến cao</option>
                                <option value="desc">Giá: Cao đến thấp</option>
                            </select>
                            <ArrowUpDown size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a9aac', pointerEvents: 'none' }} />
                            <ChevronDown size={15} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a9aac', pointerEvents: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {categoriesWithCount.map(cat => {
                            const isActive = cat.id === '' ? selectedCategory === '' : selectedCategory === cat.name;
                            return (
                                <button
                                    key={cat.id || 'all'}
                                    onClick={() => setSelectedCategory(cat.id === '' ? '' : cat.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        padding: '8px 14px',
                                        borderRadius: 999,
                                        fontSize: 13,
                                        fontWeight: 800,
                                        border: '1px solid',
                                        borderColor: isActive ? '#2563eb' : '#dbe6f3',
                                        background: isActive ? '#e8f1ff' : '#ffffff',
                                        color: isActive ? '#1d4ed8' : '#526274',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {cat.name}
                                    <span style={{
                                        minWidth: 22,
                                        height: 22,
                                        borderRadius: 999,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 7px',
                                        background: isActive ? '#2563eb' : '#eef4fb',
                                        color: isActive ? '#ffffff' : '#8a9aac',
                                        fontSize: 11,
                                    }}>
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {!loading && (
                    <p style={{ color: '#526274', fontSize: 13, marginBottom: 18 }}>
                        Hiển thị <strong style={{ color: '#132033' }}>{filteredDocs.length}</strong> tài liệu
                        {selectedCategory && <> trong <strong style={{ color: '#1d4ed8' }}>{selectedCategory}</strong></>}
                    </p>
                )}

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '74px 20px', background: '#ffffff', borderRadius: 8, border: '1px solid #dbe6f3', boxShadow: '0 14px 34px rgba(27,55,100,0.08)' }}>
                        <BookOpen size={52} color="#9ab0cb" style={{ marginBottom: 16 }} />
                        <h2 style={{ color: '#132033', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>Không tìm thấy tài liệu</h2>
                        <p style={{ color: '#526274', fontSize: 14, marginBottom: 18 }}>Thử đổi từ khóa hoặc chọn lại danh mục.</p>
                        <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }} className="btn-secondary" style={{ padding: '10px 18px' }}>
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
                        {filteredDocs.map(doc => {
                            const price = doc.salePrice != null ? doc.salePrice : doc.price;
                            return (
                                <Link to={`/documents/${doc.slug}`} key={doc.id} className="product-card">
                                    <div className="card-thumb" style={{ height: 184, background: '#eef6ff', position: 'relative' }}>
                                        {doc.thumbnailPath ? (
                                            <img src={getUploadUrl(doc.thumbnailPath) || ''} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#9ab0cb' }}>
                                                <BookOpen size={38} />
                                                <span style={{ fontSize: 12 }}>Chưa có ảnh</span>
                                            </div>
                                        )}
                                        {doc.salePrice != null && (
                                            <span style={{ position: 'absolute', top: 10, left: 10, background: '#f43f5e', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 6 }}>
                                                SALE
                                            </span>
                                        )}
                                        {doc.categoryName && (
                                            <span style={{ position: 'absolute', top: 10, right: 10, background: '#ffffff', color: '#1d4ed8', fontSize: 11, fontWeight: 800, padding: '4px 9px', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                                                {doc.categoryName}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ padding: '17px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontWeight: 900, fontSize: 15, color: '#132033', marginBottom: 8, lineHeight: 1.45, ...clamp(2) }}>
                                            {doc.title}
                                        </h3>
                                        <p style={{ color: '#526274', fontSize: 13, marginBottom: 14, flex: 1, lineHeight: 1.6, ...clamp(2) }}>
                                            {doc.shortDescription || 'Tài liệu học tập được trình bày gọn, dễ đọc và dễ áp dụng.'}
                                        </p>

                                        {doc.averageRating > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                                                <div style={{ display: 'flex', gap: 1 }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={12} fill={s <= Math.round(doc.averageRating) ? '#f59e0b' : 'none'} color={s <= Math.round(doc.averageRating) ? '#f59e0b' : '#cbd5e1'} />
                                                    ))}
                                                </div>
                                                <span style={{ color: '#526274', fontSize: 12, fontWeight: 800 }}>{doc.averageRating.toFixed(1)}</span>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                            <div>
                                                <span style={{ color: doc.salePrice != null ? '#e11d48' : '#2563eb', fontWeight: 900, fontSize: 17 }}>
                                                    {formatPrice(price)}
                                                </span>
                                                {doc.salePrice != null && (
                                                    <span style={{ color: '#8a9aac', fontSize: 12, textDecoration: 'line-through', marginLeft: 7 }}>
                                                        {formatPrice(doc.price)}
                                                    </span>
                                                )}
                                            </div>
                                            {!isAdmin && (
                                                <button
                                                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleAddToCart(doc.id); }}
                                                    style={{
                                                        width: 38,
                                                        height: 38,
                                                        borderRadius: 8,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: '#e8f1ff',
                                                        border: '1px solid #bfdbfe',
                                                        color: '#2563eb',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#e8f1ff'; e.currentTarget.style.color = '#2563eb'; }}
                                                    title="Thêm vào giỏ hàng"
                                                >
                                                    <ShoppingCart size={17} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DocumentListPage;
