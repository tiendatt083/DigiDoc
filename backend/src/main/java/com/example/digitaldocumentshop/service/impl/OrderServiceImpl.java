package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.dto.request.OrderRequest;
import com.example.digitaldocumentshop.entity.*;
import com.example.digitaldocumentshop.enums.OrderStatus;
import com.example.digitaldocumentshop.repository.*;
import com.example.digitaldocumentshop.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final com.example.digitaldocumentshop.service.VoucherService voucherService;

    public OrderServiceImpl(OrderRepository orderRepository, CartItemRepository cartItemRepository, UserRepository userRepository, DocumentRepository documentRepository, com.example.digitaldocumentshop.service.VoucherService voucherService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.voucherService = voucherService;
    }

    @Override
    @Transactional
    public Order createOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<CartItem> allCartItems = cartItemRepository.findByUserId(user.getId());

        // Lọc theo danh sách item đã chọn (nếu có)
        List<CartItem> cartItems = (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty())
                ? allCartItems.stream().filter(i -> request.getCartItemIds().contains(i.getId())).collect(Collectors.toList())
                : allCartItems;

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = cartItems.stream()
                .map(item -> {
                    BigDecimal price = item.getDocument().getSalePrice() != null ? item.getDocument().getSalePrice() : item.getDocument().getPrice();
                    return price.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        int usedPoints = 0;
        
        // --- 1. Áp dụng Voucher trước ---
        if (request.getVoucherCode() != null && !request.getVoucherCode().isEmpty()) {
            Voucher voucher = voucherService.applyVoucher(request.getVoucherCode(), totalAmount);
            if (voucher.getDiscountType() == com.example.digitaldocumentshop.enums.DiscountType.PERCENT) {
                BigDecimal voucherDiscount = totalAmount.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
                if (voucher.getMaxDiscountAmount() != null) {
                    voucherDiscount = voucherDiscount.min(voucher.getMaxDiscountAmount());
                }
                discountAmount = discountAmount.add(voucherDiscount);
            } else {
                discountAmount = discountAmount.add(voucher.getDiscountValue().min(totalAmount));
            }
        }
        
        // --- 2. Áp dụng Điểm thưởng (nếu có) ---
        if (request.getUseRewardPoints() != null && request.getUseRewardPoints() > 0) {
            BigDecimal remainingAmount = totalAmount.subtract(discountAmount);
            if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
                int requiredPoints = remainingAmount.intValue() / 1000;
                if (user.getRewardPoints() < requiredPoints) {
                    throw new RuntimeException("Không đủ điểm thưởng để thanh toán hóa đơn này (cần " + requiredPoints + " điểm)");
                }
                discountAmount = discountAmount.add(remainingAmount); // Full discount of remaining
                usedPoints = requiredPoints;
                user.setRewardPoints(user.getRewardPoints() - requiredPoints);
                userRepository.save(user);
            }
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;

        String orderCode = "ORD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        OrderStatus initialStatus = OrderStatus.PENDING_PAYMENT;
        if (finalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            initialStatus = OrderStatus.PAID;
        }

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(initialStatus)
                .usedRewardPoints(usedPoints)
                .build();

        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            BigDecimal price = cartItem.getDocument().getSalePrice() != null ? cartItem.getDocument().getSalePrice() : cartItem.getDocument().getPrice();
            return OrderItem.builder()
                    .order(order)
                    .document(cartItem.getDocument())
                    .quantity(cartItem.getQuantity())
                    .price(price)
                    .build();
        }).collect(Collectors.toList());

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        if (initialStatus == OrderStatus.PAID) {
            for (OrderItem item : orderItems) {
                Document doc = item.getDocument();
                doc.setTotalSales(doc.getTotalSales() + item.getQuantity());
                documentRepository.save(doc);
            }
        }

        // Chỉ xóa các item đã được checkout (giữ lại các item chưa chọn)
        List<Long> checkedOutIds = cartItems.stream().map(CartItem::getId).collect(Collectors.toList());
        checkedOutIds.forEach(cartItemRepository::deleteById);

        return savedOrder;
    }

    @Override
    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public Order getOrderByCodeForUser(String orderCode, String email) {
        Order order = getOrderByCode(orderCode);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != com.example.digitaldocumentshop.enums.Role.ROLE_ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        return order;
    }

    @Override
    public List<Order> getMyOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Override
    @Transactional
    public void updateOrderStatus(String orderCode, String status) {
        Order order = getOrderByCode(orderCode);
        order.setStatus(OrderStatus.valueOf(status));
        orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public Order updateOrderStatusById(Long id, String status) {
        Order order = getOrderById(id);
        order.setStatus(OrderStatus.valueOf(status));
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(String orderCode, String email) {
        Order order = getOrderByCode(orderCode);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        // Ch\u1ec9 ch\u1ee7 \u0111\u01a1n ho\u1eb7c admin m\u1edbi \u0111\u01b0\u1ee3c h\u1ee7y
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Kh\u00f4ng c\u00f3 quy\u1ec1n h\u1ee7y \u0111\u01a1n h\u00e0ng n\u00e0y.");
        }

        // Ch\u1ec9 h\u1ee7y \u0111\u01b0\u1ee3c khi \u0111\u01a1n \u0111ang ch\u1edd thanh to\u00e1n
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Kh\u00f4ng th\u1ec3 h\u1ee7y \u0111\u01a1n \u0111\u00e3 thanh to\u00e1n ho\u1eb7c \u0111\u00e3 h\u1ee7y tr\u01b0\u1edbc \u0111\u00f3.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}
