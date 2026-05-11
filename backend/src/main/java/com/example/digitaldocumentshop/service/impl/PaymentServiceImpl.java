package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.entity.Order;
import com.example.digitaldocumentshop.entity.Payment;
import com.example.digitaldocumentshop.entity.PointHistory;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.enums.OrderStatus;
import com.example.digitaldocumentshop.enums.PaymentStatus;
import com.example.digitaldocumentshop.repository.OrderRepository;
import com.example.digitaldocumentshop.repository.PaymentRepository;
import com.example.digitaldocumentshop.repository.PointHistoryRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.repository.DocumentRepository;
import com.example.digitaldocumentshop.service.PaymentService;
import com.example.digitaldocumentshop.entity.OrderItem;
import com.example.digitaldocumentshop.entity.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final DocumentRepository documentRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, OrderRepository orderRepository, UserRepository userRepository, PointHistoryRepository pointHistoryRepository, DocumentRepository documentRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.pointHistoryRepository = pointHistoryRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    @Transactional
    public Payment createPayment(String orderCode, String paymentMethod, String email) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Order is not pending payment");
        }

        java.util.Optional<Payment> existing = paymentRepository.findByOrderId(order.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getFinalAmount())
                .paymentMethod(paymentMethod)
                .status(PaymentStatus.UNPAID)
                .build();

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment processWebhook(String orderCode, boolean isSuccess, BigDecimal transferAmount, String referenceCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.PAID || order.getStatus() == OrderStatus.PAID) {
            return payment;
        }

        if (transferAmount != null && transferAmount.compareTo(order.getFinalAmount()) < 0) {
            throw new RuntimeException("Transfer amount is less than order amount");
        }

        if (isSuccess) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionId(referenceCode != null && !referenceCode.isBlank() ? referenceCode : "TXN" + System.currentTimeMillis());
            
            order.setStatus(OrderStatus.PAID);
            
            // Increment total sales
            for (OrderItem item : order.getItems()) {
                Document doc = item.getDocument();
                doc.setTotalSales(doc.getTotalSales() + item.getQuantity());
                documentRepository.save(doc);
            }
            
            // Add reward points (Demo logic: 1 point for every 10,000 VND spent)
            User user = order.getUser();
            int pointsEarned = order.getFinalAmount().intValue() / 10000;
            user.setRewardPoints(user.getRewardPoints() + pointsEarned);
            userRepository.save(user);

            // Record point history
            if (pointsEarned > 0) {
                PointHistory history = PointHistory.builder()
                        .user(user)
                        .points(pointsEarned)
                        .reason("Thanh toán đơn hàng " + order.getOrderCode())
                        .type("EARN")
                        .build();
                pointHistoryRepository.save(history);
            }

            System.out.println("✅ Thanh toán thành công: " + orderCode + " | Điểm thưởng: " + pointsEarned);
            // Download permission is implicitly granted by order.status == PAID
            
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
        return paymentRepository.save(payment);
    }

    @Value("${bank.id:MB}")
    private String bankId;

    @Value("${bank.account-number:YOUR_ACCOUNT_NUMBER}")
    private String bankAccountNumber;

    @Value("${bank.account-name:YOUR_ACCOUNT_NAME}")
    private String bankAccountName;

    @Value("${bank.display-name:MB Bank}")
    private String bankDisplayName;

    @Value("${app.transfer-prefix:DIGIDOC}")
    private String transferPrefix;

    @Override
    public Map<String, Object> getPaymentQRInfo(String orderCode, String email) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Nội dung chuyển khoản = PREFIX + orderCode (VD: "DIGIDOC ORD20240101")
        String transferContent = transferPrefix + " " + orderCode;

        // VietQR Quick Link — miễn phí, không cần API key
        String vietQrUrl = String.format(
            "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
            bankId,
            bankAccountNumber,
            order.getFinalAmount().longValue(),
            transferContent.replace(" ", "%20"),
            bankAccountName.replace(" ", "%20")
        );

        Map<String, Object> info = new HashMap<>();
        info.put("orderCode", order.getOrderCode());
        info.put("amount", order.getFinalAmount());
        info.put("status", order.getStatus());
        info.put("bankName", bankDisplayName);
        info.put("bankId", bankId);
        info.put("bankAccount", bankAccountNumber);
        info.put("accountHolder", bankAccountName);
        info.put("transferContent", transferContent);
        info.put("qrImageUrl", vietQrUrl);

        return info;
    }
}
