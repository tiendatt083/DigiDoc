package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.entity.Document;
import com.example.digitaldocumentshop.entity.DownloadLog;
import com.example.digitaldocumentshop.entity.Order;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.enums.OrderStatus;
import com.example.digitaldocumentshop.repository.DocumentRepository;
import com.example.digitaldocumentshop.repository.DownloadLogRepository;
import com.example.digitaldocumentshop.repository.OrderRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/downloads")
public class FileDownloadController {

    private final FileStorageService fileStorageService;
    private final OrderRepository orderRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DownloadLogRepository downloadLogRepository;

    public FileDownloadController(FileStorageService fileStorageService, OrderRepository orderRepository, DocumentRepository documentRepository, UserRepository userRepository, DownloadLogRepository downloadLogRepository) {
        this.fileStorageService = fileStorageService;
        this.orderRepository = orderRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.downloadLogRepository = downloadLogRepository;
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long documentId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Check if user has bought this document and order is PAID
        boolean hasBought = false;
        Order validOrder = null;
        for (Order order : orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())) {
            if (order.getStatus() == OrderStatus.PAID) {
                boolean containsDoc = order.getItems().stream()
                        .anyMatch(item -> item.getDocument().getId().equals(documentId));
                if (containsDoc) {
                    hasBought = true;
                    validOrder = order;
                    break;
                }
            }
        }

        // Admin can download without buying
        if (!hasBought && !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("You must purchase this document to download it.");
        }

        // Log download
        DownloadLog log = DownloadLog.builder()
                .document(document)
                .user(user)
                .order(validOrder)
                .downloadCount(1)
                .lastDownloadedAt(LocalDateTime.now())
                .build();
        downloadLogRepository.save(log);

        Path filePath = fileStorageService.loadFileAsResource(document.getOriginalFilePath());
        
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                String originalFileName = filePath.getFileName().toString();
                String extension = "";
                int i = originalFileName.lastIndexOf('.');
                if (i > 0) {
                    extension = originalFileName.substring(i);
                }
                String downloadName = document.getTitle();
                if (!downloadName.endsWith(extension)) {
                    downloadName += extension;
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(document.getFileType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found");
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found", ex);
        }
    }

    @GetMapping("/{documentId}/preview")
    public ResponseEntity<Resource> previewFile(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getPreviewFilePath() == null || document.getPreviewFilePath().isEmpty()) {
            throw new RuntimeException("Preview not available for this document");
        }

        Path filePath = fileStorageService.loadFileAsResource(document.getPreviewFilePath());
        
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("application/pdf"))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"preview_" + document.getTitle() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Preview file not found");
            }
        } catch (Exception ex) {
            throw new RuntimeException("Preview file not found", ex);
        }
    }
}
