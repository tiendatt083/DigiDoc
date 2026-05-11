package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.entity.Payment;
import com.example.digitaldocumentshop.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<Payment> createPayment(@RequestParam String orderCode, @RequestParam String paymentMethod, Authentication authentication) {
        return ResponseEntity.ok(paymentService.createPayment(orderCode, paymentMethod, authentication.getName()));
    }

    // Get QR info for bank transfer payment
    @GetMapping("/qr/{orderCode}")
    public ResponseEntity<?> getPaymentQR(@PathVariable String orderCode, Authentication authentication) {
        return ResponseEntity.ok(paymentService.getPaymentQRInfo(orderCode, authentication.getName()));
    }
}
