package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.dto.request.UpdateProfileRequest;
import com.example.digitaldocumentshop.dto.response.UserProfileResponse;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoint hồ sơ người dùng (xem + cập nhật thông tin cá nhân).
 */
@RestController
@RequestMapping("/api/user/profile")
public class UserProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Lấy thông tin cá nhân */
    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(mapToResponse(user));
    }

    /** Cập nhật họ tên, số điện thoại */
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        userRepository.save(user);
        return ResponseEntity.ok(mapToResponse(user));
    }

    /** Đổi mật khẩu */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu hiện tại không đúng"));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu mới phải có ít nhất 6 ký tự"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    private UserProfileResponse mapToResponse(User user) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setPhoneNumber(user.getPhoneNumber());
        res.setRewardPoints(user.getRewardPoints());
        res.setRole(user.getRole().name());
        return res;
    }
}
