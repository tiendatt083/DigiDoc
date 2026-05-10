package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.dto.request.OrderRequest;
import com.example.digitaldocumentshop.entity.Order;
import com.example.digitaldocumentshop.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        return ResponseEntity.ok(orderService.createOrder(authentication.getName(), orderRequest));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrders(authentication.getName()));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<Order> getOrder(@PathVariable String orderCode) {
        return ResponseEntity.ok(orderService.getOrderByCode(orderCode));
    }

    @PostMapping("/cancel/{orderCode}")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderCode, Authentication authentication) {
        orderService.cancelOrder(orderCode, authentication.getName());
        return ResponseEntity.ok(java.util.Map.of("message", "Đã hủy đơn hàng."));
    }
}
