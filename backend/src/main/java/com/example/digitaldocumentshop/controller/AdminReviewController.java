package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.entity.Review;
import com.example.digitaldocumentshop.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    private final ReviewRepository reviewRepository;

    public AdminReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        List<Map<String, Object>> response = reviews.stream().map(r -> Map.of(
                "id", r.getId(),
                "rating", r.getRating(),
                "comment", r.getComment(),
                "adminReply", r.getAdminReply() != null ? r.getAdminReply() : "",
                "isHidden", r.getIsHidden(),
                "createdAt", r.getCreatedAt(),
                "user", Map.of("email", r.getUser().getEmail(), "fullName", r.getUser().getFullName()),
                "document", Map.of("id", r.getDocument().getId(), "title", r.getDocument().getTitle())
        )).toList();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<?> replyToReview(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setAdminReply(payload.get("adminReply"));
        reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã trả lời đánh giá"));
    }

    @PutMapping("/{id}/toggle-hide")
    public ResponseEntity<?> toggleHideReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setIsHidden(!review.getIsHidden());
        reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("success", true, "isHidden", review.getIsHidden()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa đánh giá"));
    }
}
