package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Nhận webhook từ SePay khi có giao dịch ngân hàng thành công.
 * Endpoint này PUBLIC (không cần JWT) vì SePay gọi từ server ngoài.
 *
 * Cấu hình webhook trên SePay dashboard:
 *   URL: http://YOUR_DOMAIN:8080/api/payments/webhook/sepay
 *   Method: POST
 */
@RestController
@RequestMapping("/api/payments/webhook")
public class SepayWebhookController {

    private final PaymentService paymentService;

    // Secret token để xác thực request từ SePay (cấu hình trong application.yml)
    @Value("${sepay.webhook-token:}")
    private String webhookToken;

    // Prefix nội dung chuyển khoản để tìm orderCode (vd: "DIGIDOC ")
    @Value("${app.transfer-prefix:DIGIDOC}")
    private String transferPrefix;

    public SepayWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * SePay gửi POST request với body JSON khi phát hiện giao dịch mới.
     * Body mẫu:
     * {
     *   "id": 12345,
     *   "gateway": "MBBank",
     *   "transactionDate": "2024-01-01 09:00:00",
     *   "accountNumber": "0394566547",
     *   "code": "DIGIDOC ORD20240101",
     *   "content": "DIGIDOC ORD20240101 chuyen khoan",
     *   "transferType": "in",
     *   "transferAmount": 50000,
     *   "referenceCode": "FT24001000001"
     * }
     */
    @PostMapping("/sepay")
    public ResponseEntity<?> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> payload) {

        // 1. Xác thực token nếu đã cấu hình
        if (!webhookToken.isBlank()) {
            String expectedAuth = "Apikey " + webhookToken;
            if (!expectedAuth.equals(authHeader)) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
        }

        try {
            // 2. Chỉ xử lý giao dịch tiền VÀO (transferType = "in")
            String transferType = (String) payload.get("transferType");
            if (!"in".equalsIgnoreCase(transferType)) {
                return ResponseEntity.ok(Map.of("message", "Ignored: not an incoming transfer"));
            }

            // 3. Lấy nội dung chuyển khoản (field "content" hoặc "code")
            String content = (String) payload.getOrDefault("content", "");
            if (content == null || content.isBlank()) {
                content = (String) payload.getOrDefault("code", "");
            }

            System.out.println("📥 SePay Webhook nhận được | content: " + content);

            // 4. Tìm orderCode trong nội dung CK
            // Nội dung CK có dạng: "DIGIDOC ORD20240101" hoặc "DIGIDOC ORD20240101 xyz"
            String orderCode = extractOrderCode(content.toUpperCase());
            if (orderCode == null) {
                System.out.println("⚠️ Không tìm thấy orderCode trong nội dung: " + content);
                return ResponseEntity.ok(Map.of("message", "No orderCode found in content"));
            }

            System.out.println("🔍 Xử lý thanh toán cho đơn hàng: " + orderCode);

            BigDecimal transferAmount = parseAmount(payload.get("transferAmount"));
            String referenceCode = payload.get("referenceCode") != null ? payload.get("referenceCode").toString() : null;

            // 5. Xử lý thanh toán
            paymentService.processWebhook(orderCode, true, transferAmount, referenceCode);

            System.out.println("✅ Thanh toán thành công: " + orderCode);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment confirmed for order: " + orderCode
            ));

        } catch (Exception e) {
            System.err.println("❌ Lỗi xử lý SePay webhook: " + e.getMessage());
            // Trả 200 để SePay không retry, log lỗi để xem sau
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Trích xuất orderCode từ nội dung chuyển khoản.
     * Ví dụ: "DIGIDOC ORD20240101ABC" → "ORD20240101ABC"
     */
    private String extractOrderCode(String content) {
        String prefix = transferPrefix.toUpperCase();
        int idx = content.indexOf(prefix);
        if (idx == -1) return null;

        // Lấy phần sau prefix, bỏ khoảng trắng đầu
        String afterPrefix = content.substring(idx + prefix.length()).trim();
        if (afterPrefix.isBlank()) return null;

        // Lấy từ đầu tiên (orderCode không có dấu cách)
        return afterPrefix.split("\\s+")[0];
    }

    private BigDecimal parseAmount(Object amount) {
        if (amount == null) return null;
        try {
            return new BigDecimal(amount.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
