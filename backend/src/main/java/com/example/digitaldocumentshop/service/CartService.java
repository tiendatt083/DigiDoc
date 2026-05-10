package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.dto.request.CartRequest;
import com.example.digitaldocumentshop.entity.CartItem;

import java.util.List;

public interface CartService {
    List<CartItem> getCartItems(String email);
    void addToCart(String email, CartRequest request);
    void updateQuantity(String email, Long cartItemId, Integer quantity);
    void removeFromCart(String email, Long cartItemId);
    void clearCart(String email);
}
