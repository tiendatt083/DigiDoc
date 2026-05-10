package com.example.digitaldocumentshop.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String voucherCode;
    private Integer useRewardPoints;
    private List<Long> cartItemIds; // null = tất cả item trong giỏ
}
