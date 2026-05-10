package com.example.digitaldocumentshop.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartRequest {
    @NotNull
    private Long documentId;
    private Integer quantity = 1;
}
