package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.entity.Payment;

import java.util.Map;

public interface PaymentService {
    Payment createPayment(String orderCode, String paymentMethod);
    Payment processWebhook(String orderCode, boolean isSuccess);
    Map<String, Object> getPaymentQRInfo(String orderCode);
}
