package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.dto.request.OrderRequest;
import com.example.digitaldocumentshop.entity.Order;

import java.util.List;

public interface OrderService {
    Order createOrder(String email, OrderRequest request);
    Order getOrderByCode(String orderCode);
    List<Order> getMyOrders(String email);
    void updateOrderStatus(String orderCode, String status);
    List<Order> getAllOrders();
    Order getOrderById(Long id);
    Order updateOrderStatusById(Long id, String status);
    void cancelOrder(String orderCode, String email);
}
