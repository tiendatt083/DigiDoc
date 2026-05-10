package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.dto.request.DocumentRequest;
import com.example.digitaldocumentshop.dto.response.DocumentResponse;

import java.util.List;

public interface DocumentService {
    List<DocumentResponse> getAllDocuments();       // Admin: ALL statuses
    List<DocumentResponse> getAllActiveDocuments(); // User: only ACTIVE
    DocumentResponse getDocumentBySlug(String slug);
    List<DocumentResponse> getRelatedDocuments(Long documentId);
    DocumentResponse createDocument(DocumentRequest documentRequest);
    DocumentResponse updateDocument(Long id, DocumentRequest documentRequest);
    void deleteDocument(Long id);
}
