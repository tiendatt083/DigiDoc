import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

const formatDate = (str) =>
  str ? new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

const sanitizeHtml = (html = '') => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, link, meta').forEach(el => el.remove());
  doc.body.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};

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
      <span style={{ color: '#526274' }}>Đang tải bài viết...</span>
    </div>
  );

  if (notFound) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#526274' }}>
      <h2 style={{ fontSize: 24, color: '#132033', fontWeight: 900 }}>Bài viết không tồn tại</h2>
      <Link to="/blog" className="btn-secondary" style={{ marginTop: 14 }}>
        <ArrowLeft size={16}/> Quay lại Blog
      </Link>
    </div>
  );

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '42px 24px 80px' }}>
      <Link to="/blog" className="btn-secondary" style={{ padding: '9px 16px', fontSize: 13, marginBottom: 28 }}>
        <ArrowLeft size={16}/> Tất cả bài viết
      </Link>

      <article className="glass-card" style={{ overflow: 'hidden' }}>
        {blog.thumbnail && (
          <img
            src={blog.thumbnail}
            alt={blog.title}
            style={{ width: '100%', height: 'min(420px,48vw)', minHeight: 240, objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        <div style={{ padding: '30px clamp(22px,5vw,42px) 42px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#526274', fontSize: 13, fontWeight: 700 }}>
              <Calendar size={14}/> {formatDate(blog.createdAt)}
            </span>
            {blog.keywords && blog.keywords.split(',').slice(0, 3).map(kw => (
              <span key={kw} className="pill pill-green" style={{ fontSize: 11, padding: '3px 10px' }}>
                <Tag size={10}/> {kw.trim()}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(30px,4vw,44px)', fontWeight: 900, color: '#132033', lineHeight: 1.22, margin: '0 0 22px', letterSpacing: 0 }}>
            {blog.title}
          </h1>

          {blog.metaDescription && (
            <p style={{ color: '#526274', fontSize: 17, lineHeight: 1.75, margin: '0 0 26px', paddingBottom: 22, borderBottom: '1px solid #dbe6f3' }}>
              {blog.metaDescription}
            </p>
          )}

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
            style={{ color: '#526274', lineHeight: 1.9, fontSize: 16 }}
          />
        </div>
      </article>

      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
        <Link to="/blog" className="btn-secondary">
          <ArrowLeft size={16}/> Xem thêm bài viết khác
        </Link>
      </div>
    </main>
  );
}
