package com.example.digitaldocumentshop.repository;

import com.example.digitaldocumentshop.entity.DownloadLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DownloadLogRepository extends JpaRepository<DownloadLog, Long> {
    Optional<DownloadLog> findByUserIdAndDocumentId(Long userId, Long documentId);
}
