package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.dto.request.CartRequest;
import com.example.digitaldocumentshop.entity.CartItem;
import com.example.digitaldocumentshop.entity.Document;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.repository.CartItemRepository;
import com.example.digitaldocumentshop.repository.DocumentRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public CartServiceImpl(CartItemRepository cartItemRepository, UserRepository userRepository, DocumentRepository documentRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<CartItem> getCartItems(String email) {
        User user = getUser(email);
        return cartItemRepository.findByUserId(user.getId());
    }

    @Override
    @Transactional
    public void addToCart(String email, CartRequest request) {
        User user = getUser(email);
        Document document = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndDocumentId(user.getId(), document.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .user(user)
                    .document(document)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(item);
        }
    }

    @Override
    @Transactional
    public void updateQuantity(String email, Long cartItemId, Integer quantity) {
        User user = getUser(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    @Override
    @Transactional
    public void removeFromCart(String email, Long cartItemId) {
        User user = getUser(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        User user = getUser(email);
        cartItemRepository.deleteByUserId(user.getId());
    }
}
