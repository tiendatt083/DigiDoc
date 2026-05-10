package com.example.digitaldocumentshop.dto.response;

import com.example.digitaldocumentshop.enums.DocumentStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DocumentResponse {
    private Long id;
    private String title;
    private String slug;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal salePrice;
    private String fileType;
    private Long fileSize;
    private String thumbnailPath;
    private String thumbnailPath2;
    private String thumbnailPath3;
    private Long categoryId;       // thêm để form edit có thể pre-select đúng danh mục
    private String categoryName;
    private Integer totalSales;
    private Integer totalViews;
    private Double averageRating;
    private DocumentStatus status;
}

