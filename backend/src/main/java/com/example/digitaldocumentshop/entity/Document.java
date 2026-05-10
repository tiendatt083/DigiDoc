package com.example.digitaldocumentshop.entity;

import com.example.digitaldocumentshop.enums.DocumentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Document extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal salePrice;

    private String fileType;
    
    private Long fileSize; // in bytes

    @Column(nullable = false)
    private String originalFilePath;

    private String previewFilePath;

    private String thumbnailPath;
    private String thumbnailPath2;
    private String thumbnailPath3;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"documents", "hibernateLazyInitializer", "handler"})
    private Category category;

    @Column(nullable = false)
    private Integer totalSales = 0;

    @Column(nullable = false)
    private Integer totalViews = 0;

    @Column(nullable = false)
    private Double averageRating = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.ACTIVE;

    @Column(nullable = false)
    private Boolean isFeatured = false;
}
