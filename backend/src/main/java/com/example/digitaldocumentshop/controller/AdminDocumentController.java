package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.dto.request.DocumentRequest;
import com.example.digitaldocumentshop.dto.response.DocumentResponse;
import com.example.digitaldocumentshop.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/documents")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDocumentController {

    private final DocumentService documentService;

    public AdminDocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /** Lấy TOÀN BỘ tài liệu (bao gồm cả HIDDEN) cho admin quản lý */
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    /** Tạo tài liệu mới */
    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(@ModelAttribute DocumentRequest documentRequest) {
        return ResponseEntity.ok(documentService.createDocument(documentRequest));
    }

    /** Cập nhật tài liệu (bao gồm status, ảnh, file) */
    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable Long id,
            @ModelAttribute DocumentRequest documentRequest) {
        return ResponseEntity.ok(documentService.updateDocument(id, documentRequest));
    }

    /** Xoá mềm (chuyển sang HIDDEN) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}

