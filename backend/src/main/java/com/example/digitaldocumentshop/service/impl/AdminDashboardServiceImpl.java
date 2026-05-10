package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.enums.OrderStatus;
import com.example.digitaldocumentshop.repository.DocumentRepository;
import com.example.digitaldocumentshop.repository.OrderRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.service.AdminDashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final DocumentRepository documentRepository;

    public AdminDashboardServiceImpl(UserRepository userRepository,
                                     OrderRepository orderRepository,
                                     DocumentRepository documentRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Số liệu thật từ database
        summary.put("totalUsers", userRepository.count());
        summary.put("totalOrders", orderRepository.count());
        summary.put("totalDocuments", documentRepository.count());

        // Doanh thu thật: chỉ tính các đơn PAID
        BigDecimal realRevenue = orderRepository.sumRevenuePaid();
        summary.put("totalRevenue", realRevenue != null ? realRevenue : BigDecimal.ZERO);

        // Đơn đã thanh toán
        summary.put("paidOrders", orderRepository.countByStatus(OrderStatus.PAID));

        // Đơn đang chờ xử lý
        summary.put("pendingOrders", orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT));

        return summary;
    }

    @Override
    public Map<String, Object> getRevenueChart() {
        // Trả về map rỗng, chart sẽ dùng dữ liệu thật khi tích hợp sau
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("data", new Object[]{});
        return chartData;
    }
}

