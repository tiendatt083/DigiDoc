package com.example.digitaldocumentshop.repository;

import com.example.digitaldocumentshop.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    Optional<Blog> findBySlugAndIsPublishedTrue(String slug);
    List<Blog> findByIsPublishedTrueOrderByCreatedAtDesc();
    Optional<Blog> findBySlug(String slug);
}
