package com.example.digitaldocumentshop.repository;

import com.example.digitaldocumentshop.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByIsHiddenFalseOrderByCreatedAtDesc();
    List<Review> findByDocumentIdAndIsHiddenFalse(Long documentId);
    Optional<Review> findByUserIdAndDocumentId(Long userId, Long documentId);
    Optional<Review> findByUserIdAndDocumentIdAndOrderId(Long userId, Long documentId, Long orderId);
    List<Review> findByUserId(Long userId);
}
