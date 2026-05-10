package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.entity.Blog;

import java.util.List;

public interface BlogService {
    List<Blog> getAllBlogs();
    List<Blog> getPublishedBlogs();
    Blog getBlogBySlug(String slug);
    Blog createBlog(Blog blog, String authorEmail);
    Blog updateBlog(Long id, Blog blog);
    void deleteBlog(Long id);
}
