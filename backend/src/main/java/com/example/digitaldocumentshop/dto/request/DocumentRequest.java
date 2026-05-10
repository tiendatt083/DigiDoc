package com.example.digitaldocumentshop.dto.request;

import com.example.digitaldocumentshop.enums.DocumentStatus;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class DocumentRequest {
    private String title;
    private String shortDescription;
    private String description;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Long categoryId;
    private DocumentStatus status; // ACTIVE | HIDDEN
    private MultipartFile file;
    private MultipartFile thumbnail;
    private MultipartFile thumbnail2;
    private MultipartFile thumbnail3;
}
