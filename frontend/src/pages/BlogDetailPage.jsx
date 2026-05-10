import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

const formatDate = (str) =>
  str ? new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then(res => setBlog(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (blog) {
      document.title = blog.metaTitle || blog.title;
      // Set meta description
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = blog.metaDescription || '';
    }
  }, [blog]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/>
      <span style={{ color: '#94a3b8' }}>Đang tải...</span>
    </div>
  );

  if (notFound) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
      <h2 style={{ fontSize: 24, color: '#f1f5f9' }}>Bài viết không tồn tại</h2>
      <Link to="/blog" style={{ color: '#6366f1', textDecoration: 'none', marginTop: 12, display: 'inline-block' }}>
        ← Quay lại Blog
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '40px auto', padding: '0 20px' }}>
      {/* Back link */}
      <Link
        to="/blog"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#6366f1', textDecoration: 'none', fontSize: 14,
          fontWeight: 600, marginBottom: 28
        }}
      >
        <ArrowLeft size={16}/> Tất cả bài viết
      </Link>

      {/* Thumbnail */}
      {blog.thumbnail && (
        <img
          src={blog.thumbnail} alt={blog.title}
          style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 18, marginBottom: 32 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}

      {/* Meta Info */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13 }}>
          <Calendar size={14}/> {formatDate(blog.createdAt)}
        </span>
        {blog.keywords && blog.keywords.split(',').slice(0, 3).map(kw => (
          <span key={kw} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(99,102,241,0.1)',
            color: '#a5b4fc', borderRadius: 20,
            padding: '3px 12px', fontSize: 12, fontWeight: 500
          }}>
            <Tag size={10}/> {kw.trim()}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 34, fontWeight: 900, color: '#f1f5f9',
        lineHeight: 1.25, margin: '0 0 24px'
      }}>
        {blog.title}
      </h1>

      {/* Content */}
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
        style={{
          color: '#94a3b8', lineHeight: 1.9, fontSize: 16
        }}
      />

      {/* Footer */}
      <div style={{
        marginTop: 48, paddingTop: 24,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', justifyContent: 'center'
      }}>
        <Link
          to="/blog"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 12, color: '#a5b4fc',
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
            transition: 'all 0.2s'
          }}
        >
          ← Xem thêm bài viết khác
        </Link>
      </div>
    </div>
  );
}
