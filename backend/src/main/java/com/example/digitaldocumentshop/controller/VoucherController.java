package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.entity.Voucher;
import com.example.digitaldocumentshop.enums.DiscountType;
import com.example.digitaldocumentshop.service.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyVoucher(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        BigDecimal orderAmount = body.get("orderAmount") != null
                ? new BigDecimal(body.get("orderAmount").toString()) : BigDecimal.ZERO;

        Voucher voucher = voucherService.applyVoucher(code, orderAmount);

        // Tính số tiền giảm thực tế
        BigDecimal discountAmount;
        if (voucher.getDiscountType() == DiscountType.PERCENT) {
            discountAmount = orderAmount.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (voucher.getMaxDiscountAmount() != null) {
                discountAmount = discountAmount.min(voucher.getMaxDiscountAmount());
            }
        } else {
            discountAmount = voucher.getDiscountValue().min(orderAmount);
        }

        return ResponseEntity.ok(Map.of(
                "code", voucher.getCode(),
                "name", voucher.getName(),
                "discountAmount", discountAmount,
                "discountType", voucher.getDiscountType()
        ));
    }
}
