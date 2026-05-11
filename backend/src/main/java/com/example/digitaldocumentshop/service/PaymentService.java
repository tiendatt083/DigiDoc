package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.entity.Payment;

import java.util.Map;

public interface PaymentService {
    Payment createPayment(String orderCode, String paymentMethod, String email);
    Payment processWebhook(String orderCode, boolean isSuccess, java.math.BigDecimal transferAmount, String referenceCode);
    Map<String, Object> getPaymentQRInfo(String orderCode, String email);
}
