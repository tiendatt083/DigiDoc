import { useState, useEffect } from 'react';
import { getUploadUrl } from '../config/env';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ShoppingCart, Star, FileText, Download, CheckCircle } from 'lucide-react';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';

const DocumentDetailPage = () => {
    const { slug } = useParams();
    const [doc, setDoc] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [relatedDocs, setRelatedDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(null);
    const { addToCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocAndReviews = async () => {
            try {
                const res = await api.get(`/documents/${slug}`);
                setDoc(res.data);
                if (res.data.thumbnailPath) setActiveImage(res.data.thumbnailPath);
                
                if (res.data && res.data.id) {
                    const revRes = await api.get(`/reviews/document/${res.data.id}`);
                    setReviews(revRes.data || []);
                    
                    try {
                        const relRes = await api.get(`/documents/${res.data.id}/related`);
                        setRelatedDocs(relRes.data || []);
                    } catch(e){}
                }
            } catch (err) {
                console.error("Failed to fetch document detail", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocAndReviews();
    }, [slug]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(doc.id, 1);
    };

    if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!doc) return <div className="text-center py-20"><h2 className="text-2xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2></div>;

    const price = (doc.salePrice != null ? doc.salePrice : doc.price);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                    {/* Image / Preview */}
                    <div className="lg:col-span-2 bg-slate-100 p-8 flex flex-col items-center">
                        <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
                            {activeImage ? (
                                <img src={(getUploadUrl(activeImage) || "")} alt={doc.title} className="max-w-full max-h-[400px] object-contain rounded shadow-lg" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                    <FileText size={64} className="mb-4" />
                                    <span>Chưa có ảnh</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Thumbnails row */}
                        {(doc.thumbnailPath || doc.thumbnailPath2 || doc.thumbnailPath3) && (
                            <div className="flex gap-4 mt-6 justify-center">
                                {doc.thumbnailPath && (
                                    <button onClick={() => setActiveImage(doc.thumbnailPath)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === doc.thumbnailPath ? 'border-indigo-600 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        <img src={(getUploadUrl(doc.thumbnailPath) || "")} className="w-full h-full object-cover" alt="Thumb 1" />
                                    </button>
                                )}
                                {doc.thumbnailPath2 && (
                                    <button onClick={() => setActiveImage(doc.thumbnailPath2)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === doc.thumbnailPath2 ? 'border-indigo-600 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        <img src={(getUploadUrl(doc.thumbnailPath2) || "")} className="w-full h-full object-cover" alt="Thumb 2" />
                                    </button>
                                )}
                                {doc.thumbnailPath3 && (
                                    <button onClick={() => setActiveImage(doc.thumbnailPath3)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === doc.thumbnailPath3 ? 'border-indigo-600 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        <img src={(getUploadUrl(doc.thumbnailPath3) || "")} className="w-full h-full object-cover" alt="Thumb 3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Details */}
                    <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col">
                        <div className="mb-2">
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {doc.categoryName || 'Chung'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{doc.title}</h1>
                        
                        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star size={18} fill="currentColor" />
                                <span className="font-medium text-slate-700 ml-1">{doc.averageRating.toFixed(1)}</span>
                            </div>
                            <div className="text-slate-500 text-sm">{doc.totalSales} đã bán</div>
                            <div className="text-slate-500 text-sm">{doc.totalViews} lượt xem</div>
                        </div>
                        
                        <div className="mb-8">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-4xl font-black text-indigo-600">{formatPrice(price)}</span>
                                {doc.salePrice != null && <span className="text-xl text-slate-400 line-through mb-1">{formatPrice(doc.price)}</span>}
                            </div>
                            <p className="text-sm text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle size={16} /> Truy cập tức thì qua Tải xuống</p>
                        </div>
                        
                        <div className="prose prose-sm sm:prose max-w-none text-slate-600 mb-8">
                            <p>{doc.description || doc.shortDescription || 'Chưa có mô tả chi tiết.'}</p>
                        </div>
                        
                        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                            {(!user || !user.roles?.includes('ROLE_ADMIN')) && (
                                <button 
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={20} /> Thêm vào giỏ hàng
                                </button>
                            )}
                        </div>
                        
                        <div className="mt-6 flex items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2"><FileText size={16} /> {doc.fileType || 'Document'}</div>
                            <div className="flex items-center gap-2"><Download size={16} /> {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Star className="text-amber-500" fill="currentColor" size={24} /> 
                    Đánh giá từ khách hàng ({reviews.length})
                </h2>
                
                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Chưa có đánh giá nào cho sản phẩm này.</div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                        {review.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{review.user?.fullName || 'Người dùng ẩn danh'}</div>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-300"} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ml-auto text-xs text-slate-400">
                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                <p className="text-slate-600 mt-3">{review.comment}</p>
                                
                                {review.adminReply && (
                                    <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100 ml-4">
                                        <div className="font-semibold text-sm text-indigo-700 mb-1">Phản hồi từ Admin:</div>
                                        <p className="text-sm text-slate-600">{review.adminReply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Related Products */}
            {relatedDocs.length > 0 && (
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 font-[Space Grotesk]">Gợi ý các sản phẩm khác</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedDocs.map(item => {
                            const price = item.salePrice != null ? item.salePrice : item.price;
                            return (
                                <Link to={`/documents/${item.slug}`} key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all block text-decoration-none group">
                                    <div className="aspect-[4/3] rounded-xl mb-4 overflow-hidden bg-slate-100 relative">
                                        {item.thumbnailPath ? (
                                            <img src={getUploadUrl(item.thumbnailPath)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <FileText size={40} />
                                            </div>
                                        )}
                                        {item.salePrice != null && Number(item.salePrice) < Number(item.price) && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">SALE</div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{item.title}</h4>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-indigo-600 font-bold">{formatPrice(price)}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentDetailPage;
