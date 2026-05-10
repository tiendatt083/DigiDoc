package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.dto.request.DocumentRequest;
import com.example.digitaldocumentshop.dto.response.DocumentResponse;
import com.example.digitaldocumentshop.entity.Category;
import com.example.digitaldocumentshop.entity.Document;
import com.example.digitaldocumentshop.enums.DocumentStatus;
import com.example.digitaldocumentshop.repository.CategoryRepository;
import com.example.digitaldocumentshop.repository.DocumentRepository;
import com.example.digitaldocumentshop.service.CloudinaryService;
import com.example.digitaldocumentshop.service.DocumentService;
import com.example.digitaldocumentshop.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;   // PDF file download (local/serve)
    private final CloudinaryService cloudinaryService;      // Ảnh thumbnail → Cloudinary

    public DocumentServiceImpl(DocumentRepository documentRepository,
                                CategoryRepository categoryRepository,
                                FileStorageService fileStorageService,
                                CloudinaryService cloudinaryService) {
        this.documentRepository = documentRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponse> getAllActiveDocuments() {
        return documentRepository.findByStatus(DocumentStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentResponse getDocumentBySlug(String slug) {
        Document document = documentRepository.findBySlugAndStatus(slug, DocumentStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        document.setTotalViews(document.getTotalViews() + 1);
        documentRepository.save(document);
        return mapToResponse(document);
    }

    @Override
    public List<DocumentResponse> getRelatedDocuments(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return documentRepository.findByCategoryIdAndStatus(document.getCategory().getId(), DocumentStatus.ACTIVE)
                .stream()
                .filter(d -> !d.getId().equals(documentId))
                .limit(4)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DocumentResponse createDocument(DocumentRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // ── File PDF/tài liệu → lưu local (để FileDownloadController phục vụ download)
        String originalFileName = fileStorageService.storeFile(request.getFile(), "doc");

        // ── Ảnh thumbnail → upload lên Cloudinary (URL vĩnh viễn, không mất khi redeploy)
        String thumbnailUrl = null;
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            thumbnailUrl = cloudinaryService.uploadImage(request.getThumbnail());
        }
        String thumbnailUrl2 = null;
        if (request.getThumbnail2() != null && !request.getThumbnail2().isEmpty()) {
            thumbnailUrl2 = cloudinaryService.uploadImage(request.getThumbnail2());
        }
        String thumbnailUrl3 = null;
        if (request.getThumbnail3() != null && !request.getThumbnail3().isEmpty()) {
            thumbnailUrl3 = cloudinaryService.uploadImage(request.getThumbnail3());
        }

        String slug = request.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-");

        Document document = Document.builder()
                .title(request.getTitle())
                .slug(slug + "-" + System.currentTimeMillis())
                .shortDescription(request.getShortDescription())
                .description(request.getDescription())
                .price(request.getPrice())
                .salePrice(request.getSalePrice())
                .category(category)
                .originalFilePath(originalFileName)
                .thumbnailPath(thumbnailUrl)        // Cloudinary URL
                .thumbnailPath2(thumbnailUrl2)      // Cloudinary URL
                .thumbnailPath3(thumbnailUrl3)      // Cloudinary URL
                .fileType(request.getFile().getContentType())
                .fileSize(request.getFile().getSize())
                .totalSales(0)
                .totalViews(0)
                .averageRating(0.0)
                .status(DocumentStatus.ACTIVE)
                .isFeatured(false)
                .build();

        if ("application/pdf".equals(request.getFile().getContentType())) {
            document.setPreviewFilePath(originalFileName);
        }

        return mapToResponse(documentRepository.save(document));
    }

    @Override
    @Transactional
    public DocumentResponse updateDocument(Long id, DocumentRequest request) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            document.setCategory(category);
        }

        if (request.getTitle() != null) document.setTitle(request.getTitle());
        if (request.getShortDescription() != null) document.setShortDescription(request.getShortDescription());
        if (request.getDescription() != null) document.setDescription(request.getDescription());
        if (request.getPrice() != null) document.setPrice(request.getPrice());
        if (request.getSalePrice() != null) document.setSalePrice(request.getSalePrice());

        // Cập nhật file PDF
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            String originalFileName = fileStorageService.storeFile(request.getFile(), "doc");
            document.setOriginalFilePath(originalFileName);
            document.setFileType(request.getFile().getContentType());
            document.setFileSize(request.getFile().getSize());
            if ("application/pdf".equals(request.getFile().getContentType())) {
                document.setPreviewFilePath(originalFileName);
            }
        }

        // Cập nhật ảnh thumbnail → Cloudinary
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            cloudinaryService.deleteFile(document.getThumbnailPath(), "image"); // Xóa ảnh cũ
            document.setThumbnailPath(cloudinaryService.uploadImage(request.getThumbnail()));
        }
        if (request.getThumbnail2() != null && !request.getThumbnail2().isEmpty()) {
            cloudinaryService.deleteFile(document.getThumbnailPath2(), "image");
            document.setThumbnailPath2(cloudinaryService.uploadImage(request.getThumbnail2()));
        }
        if (request.getThumbnail3() != null && !request.getThumbnail3().isEmpty()) {
            cloudinaryService.deleteFile(document.getThumbnailPath3(), "image");
            document.setThumbnailPath3(cloudinaryService.uploadImage(request.getThumbnail3()));
        }

        if (request.getStatus() != null) document.setStatus(request.getStatus());

        return mapToResponse(documentRepository.save(document));
    }

    @Override
    @Transactional
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        document.setStatus(DocumentStatus.HIDDEN);
        documentRepository.save(document);
    }

    private DocumentResponse mapToResponse(Document doc) {
        DocumentResponse response = new DocumentResponse();
        response.setId(doc.getId());
        response.setTitle(doc.getTitle());
        response.setSlug(doc.getSlug());
        response.setShortDescription(doc.getShortDescription());
        response.setPrice(doc.getPrice());
        response.setSalePrice(doc.getSalePrice());
        response.setFileType(doc.getFileType());
        response.setFileSize(doc.getFileSize());
        response.setThumbnailPath(doc.getThumbnailPath());
        response.setThumbnailPath2(doc.getThumbnailPath2());
        response.setThumbnailPath3(doc.getThumbnailPath3());
        if (doc.getCategory() != null) {
            response.setCategoryId(doc.getCategory().getId());
            response.setCategoryName(doc.getCategory().getName());
        }
        response.setTotalSales(doc.getTotalSales());
        response.setTotalViews(doc.getTotalViews());
        response.setAverageRating(doc.getAverageRating());
        response.setStatus(doc.getStatus());
        return response;
    }
}
