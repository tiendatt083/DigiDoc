package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.entity.Blog;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.repository.BlogRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.service.BlogService;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    public BlogServiceImpl(BlogRepository blogRepository, UserRepository userRepository) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    @Override
    public List<Blog> getPublishedBlogs() {
        return blogRepository.findByIsPublishedTrueOrderByCreatedAtDesc();
    }

    @Override
    public Blog getBlogBySlug(String slug) {
        return blogRepository.findBySlugAndIsPublishedTrue(slug)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
    }

    @Override
    public Blog createBlog(Blog blog, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("Author not found"));
        validateBlog(blog);
        blog.setAuthor(author);
        if (blog.getIsPublished() == null) blog.setIsPublished(true);
        blog.setTitle(blog.getTitle().trim());
        blog.setContent(blog.getContent().trim());
        blog.setSlug(createUniqueSlug(
                hasText(blog.getSlug()) ? blog.getSlug() : blog.getTitle(),
                null
        ));
        return blogRepository.save(blog);
    }

    @Override
    public Blog updateBlog(Long id, Blog blog) {
        Blog existing = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        
        validateBlog(blog);
        existing.setTitle(blog.getTitle().trim());
        existing.setSlug(createUniqueSlug(
                hasText(blog.getSlug()) ? blog.getSlug() : blog.getTitle(),
                existing.getId()
        ));
        existing.setContent(blog.getContent().trim());
        existing.setThumbnail(blog.getThumbnail());
        existing.setMetaTitle(blog.getMetaTitle());
        existing.setMetaDescription(blog.getMetaDescription());
        existing.setKeywords(blog.getKeywords());
        if (blog.getIsPublished() != null) {
            existing.setIsPublished(blog.getIsPublished());
        }
        return blogRepository.save(existing);
    }

    @Override
    public void deleteBlog(Long id) {
        blogRepository.deleteById(id);
    }

    private void validateBlog(Blog blog) {
        if (blog == null) {
            throw new RuntimeException("Dữ liệu bài viết không hợp lệ.");
        }
        if (!hasText(blog.getTitle())) {
            throw new RuntimeException("Tiêu đề bài viết không được để trống.");
        }
        if (!hasText(blog.getContent())) {
            throw new RuntimeException("Nội dung bài viết không được để trống.");
        }
    }

    private String createUniqueSlug(String rawSlug, Long currentBlogId) {
        String baseSlug = slugify(rawSlug);
        if (!hasText(baseSlug)) {
            baseSlug = "bai-viet";
        }

        String candidate = baseSlug;
        int suffix = 2;
        while (true) {
            Optional<Blog> existing = blogRepository.findBySlug(candidate);
            if (existing.isEmpty() || existing.get().getId().equals(currentBlogId)) {
                return candidate;
            }
            candidate = baseSlug + "-" + suffix++;
        }
    }

    private String slugify(String value) {
        if (!hasText(value)) {
            return "";
        }

        String normalized = Normalizer.normalize(value.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replace("đ", "d")
                .replace("Đ", "d")
                .replaceAll("\\p{M}", "");

        return normalized
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
