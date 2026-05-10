import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, BookOpen } from 'lucide-react';

const formatDate = (str) =>
  str ? new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blogs')
      .then(res => setBlogs(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/>
      <span style={{ color: '#94a3b8' }}>Đang tải...</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 20, padding: '6px 16px', marginBottom: 16,
          color: '#a5b4fc', fontSize: 13, fontWeight: 600
        }}>
          <BookOpen size={14}/> Blog & Tài nguyên
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px' }}>
          Kiến thức & Hướng dẫn
        </h1>
        <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>
          Chia sẻ kiến thức, mẹo học tập và tài nguyên hữu ích
        </p>
      </div>

      {blogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <BookOpen size={48} style={{ marginBottom: 16, opacity: 0.3 }}/>
          <p>Chưa có bài viết nào. Hãy quay lại sau!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {blogs.map(blog => (
            <Link
              key={blog.id}
              to={`/blog/${blog.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <article style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 18, overflow: 'hidden',
                transition: 'all 0.25s',
                cursor: 'pointer',
                height: '100%'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Thumbnail */}
                {blog.thumbnail ? (
                  <img
                    src={blog.thumbnail} alt={blog.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{
                    height: 180, background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <BookOpen size={48} style={{ color: 'rgba(99,102,241,0.4)' }}/>
                  </div>
                )}

                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: '#64748b', fontSize: 12, marginBottom: 10
                  }}>
                    <Calendar size={12}/>
                    {formatDate(blog.createdAt)}
                  </div>
                  <h2 style={{
                    fontSize: 16, fontWeight: 700, color: '#f1f5f9',
                    margin: '0 0 10px', lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {blog.title}
                  </h2>
                  {blog.metaDescription && (
                    <p style={{
                      color: '#64748b', fontSize: 13, margin: '0 0 16px',
                      lineHeight: 1.6, display: '-webkit-box',
                      WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {blog.metaDescription}
                    </p>
                  )}
                  <span style={{
                    color: '#6366f1', fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    Đọc tiếp →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
