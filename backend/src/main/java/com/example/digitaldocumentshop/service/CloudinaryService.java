package com.example.digitaldocumentshop.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * CloudinaryService — upload ảnh & file PDF lên Cloudinary.
 * 
 * Ảnh (thumb) → lưu trong folder "studydoc/images"  → trả về HTTPS URL
 * File PDF     → lưu trong folder "studydoc/files"   → trả về HTTPS URL
 * 
 * URL trả về là URL Cloudinary vĩnh viễn, không bị mất khi redeploy.
 */
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    /**
     * Upload ảnh thumbnail — trả về URL HTTPS của Cloudinary.
     */
    public String uploadImage(MultipartFile file) {
        try {
            String publicId = "studydoc/images/" + UUID.randomUUID();
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "image",
                    "overwrite", true
            ));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh lên Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Upload file tài liệu (PDF, DOCX, ...) — trả về URL HTTPS của Cloudinary.
     * Dùng resource_type=raw cho các file không phải ảnh/video.
     */
    public String uploadDocument(MultipartFile file) {
        try {
            String publicId = "studydoc/files/" + UUID.randomUUID();
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "raw",   // raw = mọi loại file
                    "overwrite", true
            ));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload file lên Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa file khỏi Cloudinary theo public_id.
     * Dùng khi cập nhật/xóa tài liệu để tránh rác trên cloud.
     */
    public void deleteFile(String url, String resourceType) {
        if (url == null || url.isBlank()) return;
        try {
            // Trích publicId từ URL Cloudinary
            String publicId = extractPublicId(url);
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException e) {
            // Log nhưng không throw — việc xóa file cũ không nên làm hỏng luồng chính
            System.err.println("Không thể xóa file Cloudinary: " + e.getMessage());
        }
    }

    private String extractPublicId(String url) {
        // Ví dụ URL: https://res.cloudinary.com/cloud/image/upload/v123/studydoc/images/uuid.jpg
        // publicId = studydoc/images/uuid (không có phần mở rộng)
        int uploadIdx = url.indexOf("/upload/");
        if (uploadIdx == -1) return url;
        String afterUpload = url.substring(uploadIdx + 8); // bỏ "/upload/"
        // Bỏ version (v123/)
        if (afterUpload.startsWith("v") && afterUpload.indexOf("/") > 0) {
            afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
        }
        // Bỏ phần extension
        int dotIdx = afterUpload.lastIndexOf(".");
        return dotIdx > 0 ? afterUpload.substring(0, dotIdx) : afterUpload;
    }
}
