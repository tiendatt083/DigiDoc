package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.dto.request.LoginRequest;
import com.example.digitaldocumentshop.dto.request.SignupRequest;
import com.example.digitaldocumentshop.dto.response.JwtResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    void registerUser(SignupRequest signUpRequest);
    void processForgotPassword(String email);
    void verifyOtp(String email, String otp);
    void resetPassword(String email, String otp, String newPassword);
    JwtResponse googleLogin(String idToken);
}
