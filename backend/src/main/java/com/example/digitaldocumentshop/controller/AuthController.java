package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.dto.request.LoginRequest;
import com.example.digitaldocumentshop.dto.request.SignupRequest;
import com.example.digitaldocumentshop.dto.response.JwtResponse;
import com.example.digitaldocumentshop.dto.response.MessageResponse;
import com.example.digitaldocumentshop.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            authService.registerUser(signUpRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody com.example.digitaldocumentshop.dto.request.GoogleLoginRequest request) {
        try {
            JwtResponse jwtResponse = authService.googleLogin(request.getIdToken());
            return ResponseEntity.ok(jwtResponse);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody com.example.digitaldocumentshop.dto.request.ForgotPasswordRequest request) {
        try {
            authService.processForgotPassword(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("OTP has been sent to your email."));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody com.example.digitaldocumentshop.dto.request.VerifyOtpRequest request) {
        try {
            authService.verifyOtp(request.getEmail(), request.getOtpCode());
            return ResponseEntity.ok(new MessageResponse("OTP is valid."));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody com.example.digitaldocumentshop.dto.request.ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getOtpCode(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password reset successfully."));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }
}
