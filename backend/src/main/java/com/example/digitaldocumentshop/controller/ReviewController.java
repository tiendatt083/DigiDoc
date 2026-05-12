package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.entity.*;
import com.example.digitaldocumentshop.enums.OrderStatus;
import com.example.digitaldocumentshop.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewController(ReviewRepository reviewRepository, DocumentRepository documentRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/{documentId}")
    public ResponseEntity<?> createReview(@PathVariable Long documentId, @RequestBody Map<String, Object> payload, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Lấy orderId từ payload
        Long orderId = payload.get("orderId") != null ? Long.parseLong(payload.get("orderId").toString()) : null;

        // Kiểm tra người dùng đã mua sản phẩm này trong đơn hàng cụ thể chưa
        boolean hasBought = false;
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Order o : orders) {
            if (o.getStatus() == OrderStatus.PAID) {
                boolean matchOrder = orderId == null || o.getId().equals(orderId);
                if (matchOrder && o.getItems().stream().anyMatch(i -> i.getDocument().getId().equals(documentId))) {
                    hasBought = true;
                    break;
                }
            }
        }

        if (!hasBought) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chưa mua tài liệu này."));
        }

        // Kiểm tra đã đánh giá đơn hàng này chưa (per order)
        if (orderId != null) {
            Optional<Review> existing = reviewRepository.findByUserIdAndDocumentIdAndOrderId(user.getId(), documentId, orderId);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Đã đánh giá đơn hàng này rồi."));
            }
        } else {
            // backward compatible: check by user+document only
            Optional<Review> existing = reviewRepository.findByUserIdAndDocumentId(user.getId(), documentId);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Đã đánh giá tài liệu này rồi."));
            }
        }

        int rating = Integer.parseInt(payload.get("rating").toString());
        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5."));
        }
        String comment = (String) payload.get("comment");

        Review review = Review.builder()
                .user(user)
                .document(document)
                .orderId(orderId)
                .rating(rating)
                .comment(comment)
                .isHidden(false)
                .build();
        
        reviewRepository.save(review);

        // Update document average rating
        List<Review> allReviews = reviewRepository.findByDocumentIdAndIsHiddenFalse(documentId);
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        document.setAverageRating(avg);
        documentRepository.save(document);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<?> getDocumentReviews(@PathVariable Long documentId) {
        List<Review> reviews = reviewRepository.findByDocumentIdAndIsHiddenFalse(documentId);
        List<Map<String, Object>> response = reviews.stream().map(this::toReviewResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getAllVisibleReviews() {
        List<Review> reviews = reviewRepository.findByIsHiddenFalseOrderByCreatedAtDesc();
        List<Map<String, Object>> response = reviews.stream().map(this::toReviewResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/{documentId}")
    public ResponseEntity<?> getMyReview(@PathVariable Long documentId, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Optional<Review> existing = reviewRepository.findByUserIdAndDocumentId(user.getId(), documentId);
        if (existing.isPresent()) {
            Review r = existing.get();
            return ResponseEntity.ok(Map.of(
                    "id", r.getId(),
                    "rating", r.getRating(),
                    "comment", r.getComment(),
                    "adminReply", r.getAdminReply() != null ? r.getAdminReply() : ""
            ));
        }
        return ResponseEntity.ok(Map.of("exists", false));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyReviewedDocumentIds(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        // Trả về danh sách {documentId, orderId} đã review
        List<Map<String, Object>> reviewed = reviewRepository.findByUserId(user.getId())
                .stream().map(r -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("documentId", r.getDocument().getId());
                    m.put("orderId", r.getOrderId());
                    return m;
                }).toList();
        return ResponseEntity.ok(reviewed);
    }

    private Map<String, Object> toReviewResponse(Review r) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", r.getId());
        response.put("rating", r.getRating());
        response.put("comment", r.getComment() != null ? r.getComment() : "");
        response.put("adminReply", r.getAdminReply() != null ? r.getAdminReply() : "");
        response.put("createdAt", r.getCreatedAt());

        Map<String, Object> user = new HashMap<>();
        user.put("fullName", r.getUser().getFullName());
        user.put("email", r.getUser().getEmail());
        response.put("user", user);

        Map<String, Object> document = new HashMap<>();
        document.put("id", r.getDocument().getId());
        document.put("title", r.getDocument().getTitle());
        document.put("slug", r.getDocument().getSlug());
        response.put("document", document);

        return response;
    }
}
