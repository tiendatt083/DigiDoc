package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.entity.Blog;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.repository.BlogRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.service.BlogService;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return blogRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
    }

    @Override
    public Blog createBlog(Blog blog, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("Author not found"));
        blog.setAuthor(author);
        if (blog.getIsPublished() == null) blog.setIsPublished(true);
        if (blog.getSlug() == null || blog.getSlug().isEmpty()) {
            blog.setSlug(blog.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        }
        return blogRepository.save(blog);
    }

    @Override
    public Blog updateBlog(Long id, Blog blog) {
        Blog existing = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        
        existing.setTitle(blog.getTitle());
        if (blog.getSlug() != null && !blog.getSlug().isEmpty()) {
            existing.setSlug(blog.getSlug());
        }
        existing.setContent(blog.getContent());
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
}
