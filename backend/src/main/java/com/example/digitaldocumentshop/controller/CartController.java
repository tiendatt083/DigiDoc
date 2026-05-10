package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.dto.request.CartRequest;
import com.example.digitaldocumentshop.dto.response.MessageResponse;
import com.example.digitaldocumentshop.entity.CartItem;
import com.example.digitaldocumentshop.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCartItems(authentication.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartRequest cartRequest, Authentication authentication) {
        cartService.addToCart(authentication.getName(), cartRequest);
        return ResponseEntity.ok(new MessageResponse("Added to cart"));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long id, @RequestParam Integer quantity, Authentication authentication) {
        cartService.updateQuantity(authentication.getName(), id, quantity);
        return ResponseEntity.ok(new MessageResponse("Quantity updated"));
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id, Authentication authentication) {
        cartService.removeFromCart(authentication.getName(), id);
        return ResponseEntity.ok(new MessageResponse("Removed from cart"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(new MessageResponse("Cart cleared"));
    }
}
