package com.example.digitaldocumentshop.repository;

import com.example.digitaldocumentshop.entity.Document;
import com.example.digitaldocumentshop.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findBySlugAndStatus(String slug, DocumentStatus status);
    List<Document> findByCategoryIdAndStatus(Long categoryId, DocumentStatus status);
    List<Document> findByStatus(DocumentStatus status);
    List<Document> findByStatusOrderByTotalSalesDesc(DocumentStatus status);
}
