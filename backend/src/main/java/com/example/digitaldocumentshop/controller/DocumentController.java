package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.dto.request.DocumentRequest;
import com.example.digitaldocumentshop.dto.response.DocumentResponse;
import com.example.digitaldocumentshop.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllActiveDocuments());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<DocumentResponse> getDocumentBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(documentService.getDocumentBySlug(slug));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<DocumentResponse>> getRelatedDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getRelatedDocuments(id));
    }

}
