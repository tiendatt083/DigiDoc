package com.example.digitaldocumentshop.repository;

import com.example.digitaldocumentshop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndDocumentId(Long userId, Long documentId);
    void deleteByUserId(Long userId);
}
