import { useState, useEffect, useMemo } from 'react';
import { getUploadUrl } from '../config/env';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, ShoppingCart, ArrowUpDown, BookOpen, Filter, Star, ChevronDown } from 'lucide-react';
import { useCartStore } from '../context/cartStore';

const DocumentListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const { addToCart } = useCartStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, catsRes] = await Promise.all([
                    api.get('/documents'),
                    api.get('/categories')
                ]);
                setDocuments(docsRes.data);
                setCategories(catsRes.data);
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
            const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.categoryName && doc.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchCategory = selectedCategory === '' || doc.categoryName === selectedCategory;
            return matchSearch && matchCategory;
        });
        if (sortOrder === 'asc') result = [...result].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        else if (sortOrder === 'desc') result = [...result].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        return result;
    }, [documents, searchTerm, selectedCategory, sortOrder]);

    const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

    const SkeletonCard = () => (
        <div style={{ background: 'rgba(15,15,40,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: 180 }} />
            <div style={{ padding: 18 }}>
                <div className="skeleton" style={{ height: 16, marginBottom: 10, width: '80%' }} />
                <div className="skeleton" style={{ height: 12, marginBottom: 6, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
        </div>
    );

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Page header */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '40px 24px 32px'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span className="pill pill-indigo"><BookOpen size={11} /> Kho Tài Liệu</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>
                        Khám Phá <span className="gradient-text">Tài Liệu Học Tập</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 15 }}>
                        {documents.length > 0 ? `${documents.length} tài liệu chất lượng cao cho học sinh & sinh viên` : 'Tải tài liệu phù hợp với nhu cầu của bạn'}
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
                {/* Search + Sort */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input-dark"
                            style={{ paddingLeft: 40 }}
                        />
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                            style={{ appearance: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 40px 11px 40px', color: '#94a3b8', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <option value="default" style={{ background: '#1a1a3a' }}>Mặc định</option>
                            <option value="asc" style={{ background: '#1a1a3a' }}>Giá: Thấp → Cao</option>
                            <option value="desc" style={{ background: '#1a1a3a' }}>Giá: Cao → Thấp</option>
                        </select>
                        <ArrowUpDown size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
                        <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
                    </div>
                </div>

                {/* Category pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {[{ id: '', name: 'Tất cả', count: documents.length }, ...categories.map(c => ({ ...c, count: documents.filter(d => d.categoryName === c.name).length }))].map(cat => {
                        const isActive = selectedCategory === cat.id.toString() || (cat.id === '' && selectedCategory === '');
                        return (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id === '' ? '' : cat.name)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: isActive ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)',
                                    background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                                    color: isActive ? '#a5b4fc' : '#64748b',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: isActive ? '0 0 12px rgba(99,102,241,0.2)' : 'none'
                                }}
                            >
                                {cat.name}
                                <span style={{
                                    padding: '1px 7px', borderRadius: 999, fontSize: 11,
                                    background: isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                                    color: isActive ? '#c7d2fe' : '#475569'
                                }}>{cat.count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Result info */}
                {!loading && (
                    <p style={{ color: '#475569', fontSize: 13, marginBottom: 20 }}>
                        Hiển thị <span style={{ color: '#94a3b8', fontWeight: 600 }}>{filteredDocs.length}</span> tài liệu
                        {selectedCategory && <> trong <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{selectedCategory}</span></>}
                    </p>
                )}

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20 }}>
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <BookOpen size={48} color="#1e1e4a" style={{ marginBottom: 16 }} />
                        <p style={{ color: '#475569', fontSize: 16 }}>Không tìm thấy tài liệu phù hợp.</p>
                        <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }} style={{ marginTop: 16, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Xóa bộ lọc</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20 }}>
                        {filteredDocs.map(doc => (
                            <Link to={`/documents/${doc.slug}`} key={doc.id} className="product-card">
                                {/* Thumbnail */}
                                <div className="card-thumb" style={{ height: 180, background: '#0d0d2b', position: 'relative' }}>
                                    {doc.thumbnailPath ? (
                                        <img src={(getUploadUrl(doc.thumbnailPath) || "")} alt={doc.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                                            <BookOpen size={36} color="#1e1e4a" />
                                            <span style={{ color: '#1e2d5a', fontSize: 11 }}>Chưa có ảnh</span>
                                        </div>
                                    )}
                                    {doc.salePrice && (
                                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg,#ef4444,#ec4899)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: 0.5 }}>SALE</div>
                                    )}
                                    {doc.categoryName && (
                                        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', color: '#a5b4fc', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.25)' }}>
                                            {doc.categoryName}
                                        </div>
                                    )}
                                    {/* gradient overlay */}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(8,8,24,0.7))' }} />
                                </div>

                                {/* Content */}
                                <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                                        {doc.title}
                                    </h3>
                                    <p style={{ color: '#475569', fontSize: 12, marginBottom: 14, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                                        {doc.shortDescription || 'Tài liệu học tập chất lượng cao'}
                                    </p>

                                    {/* Rating */}
                                    {doc.averageRating > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                                            <div style={{ display: 'flex', gap: 1 }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={11} fill={s <= Math.round(doc.averageRating) ? '#fbbf24' : 'none'} color={s <= Math.round(doc.averageRating) ? '#fbbf24' : '#374151'} />
                                                ))}
                                            </div>
                                            <span style={{ color: '#64748b', fontSize: 11 }}>{doc.averageRating.toFixed(1)}</span>
                                        </div>
                                    )}

                                    {/* Price + Cart */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            {doc.salePrice ? (
                                                <div>
                                                    <span style={{ color: '#f87171', fontWeight: 800, fontSize: 16 }}>{formatPrice(doc.salePrice)}</span>
                                                    <span style={{ color: '#334155', fontSize: 11, textDecoration: 'line-through', marginLeft: 7 }}>{formatPrice(doc.price)}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#a5b4fc', fontWeight: 800, fontSize: 16 }}>{formatPrice(doc.price)}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={e => { e.preventDefault(); e.stopPropagation(); addToCart(doc.id, 1); }}
                                            style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#6366f1', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#6366f1'; }}
                                            title="Thêm vào giỏ hàng"
                                        >
                                            <ShoppingCart size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentListPage;
