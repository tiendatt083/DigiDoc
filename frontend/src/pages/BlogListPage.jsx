import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';

const formatDate = (str) =>
  str ? new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

const clamp = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

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
      <span style={{ color: '#526274' }}>Đang tải bài viết...</span>
    </div>
  );

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '46px 24px 78px' }}>
      <header style={{ textAlign: 'center', marginBottom: 42 }}>
        <span className="pill pill-indigo" style={{ marginBottom: 14 }}>
          <BookOpen size={13}/> Blog & tài nguyên
        </span>
        <h1 style={{ fontSize: 'clamp(32px,4vw,46px)', fontWeight: 900, color: '#132033', margin: '0 0 12px', letterSpacing: 0 }}>
          Kiến thức và hướng dẫn học tập
        </h1>
        <p style={{ color: '#526274', fontSize: 16, margin: '0 auto', maxWidth: 620, lineHeight: 1.7 }}>
          Chia sẻ mẹo học tập, tài nguyên hữu ích và kinh nghiệm chọn tài liệu hiệu quả.
        </p>
      </header>

      {blogs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 20px',
          color: '#526274',
          background: '#ffffff',
          border: '1px solid #dbe6f3',
          borderRadius: 8,
          boxShadow: '0 14px 34px rgba(27,55,100,0.08)',
        }}>
          <BookOpen size={50} color="#9ab0cb" style={{ marginBottom: 16 }}/>
          <h2 style={{ color: '#132033', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>Chưa có bài viết</h2>
          <p style={{ margin: 0 }}>Hãy quay lại sau để xem các bài chia sẻ mới từ DiGiDoc.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 22 }}>
          {blogs.map(blog => (
            <Link key={blog.id} to={`/blog/${blog.slug}`} className="glass-card" style={{ overflow: 'hidden', textDecoration: 'none', display: 'block' }}>
              {blog.thumbnail ? (
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  style={{ width: '100%', height: 190, objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  height: 190,
                  background: 'linear-gradient(135deg,#e8f1ff,#e8fbf5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                }}>
                  <BookOpen size={46}/>
                </div>
              )}

              <article style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8a9aac', fontSize: 12, marginBottom: 10 }}>
                  <Calendar size={13}/>
                  {formatDate(blog.createdAt)}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#132033', margin: '0 0 10px', lineHeight: 1.45, ...clamp(2) }}>
                  {blog.title}
                </h2>
                {blog.metaDescription && (
                  <p style={{ color: '#526274', fontSize: 13, margin: '0 0 16px', lineHeight: 1.65, ...clamp(3) }}>
                    {blog.metaDescription}
                  </p>
                )}
                <span style={{ color: '#2563eb', fontSize: 13, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Đọc tiếp <ArrowRight size={14}/>
                </span>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
