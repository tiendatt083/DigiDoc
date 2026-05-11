package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.dto.request.LoginRequest;
import com.example.digitaldocumentshop.dto.request.SignupRequest;
import com.example.digitaldocumentshop.dto.response.JwtResponse;
import com.example.digitaldocumentshop.entity.OtpToken;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.enums.Role;
import com.example.digitaldocumentshop.repository.OtpTokenRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.security.JwtUtils;
import com.example.digitaldocumentshop.security.UserDetailsImpl;
import com.example.digitaldocumentshop.service.AuthService;
import com.example.digitaldocumentshop.service.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    
    @Value("${google.client-id}")
    private String googleClientId;

    public AuthServiceImpl(AuthenticationManager authenticationManager, UserRepository userRepository,
                           PasswordEncoder encoder, JwtUtils jwtUtils, OtpTokenRepository otpTokenRepository, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.otpTokenRepository = otpTokenRepository;
        this.emailService = emailService;
    }

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String lowercaseEmail = loginRequest.getEmail() != null ? loginRequest.getEmail().toLowerCase() : null;
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(lowercaseEmail, loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                user.getFullName(),
                roles);
    }

    @Override
    @Transactional
    public void registerUser(SignupRequest signUpRequest) {
        if (signUpRequest.getPassword() == null || signUpRequest.getPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu phải có từ 6 ký tự trở lên.");
        }

        String lowercaseEmail = signUpRequest.getEmail() != null ? signUpRequest.getEmail().toLowerCase() : null;

        if (userRepository.existsByEmail(lowercaseEmail)) {
            throw new RuntimeException("Tài khoản đã được đăng kí, vui lòng đăng nhập.");
        }

        User user = User.builder()
                .email(lowercaseEmail)
                .password(encoder.encode(signUpRequest.getPassword()))
                .fullName(signUpRequest.getFullName())
                .phoneNumber(signUpRequest.getPhoneNumber())
                .role(Role.ROLE_USER)
                .rewardPoints(0)
                .isActive(true)
                .build();

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void processForgotPassword(String email) {
        String lowercaseEmail = email != null ? email.toLowerCase() : null;
        User user = userRepository.findByEmail(lowercaseEmail)
                .orElseThrow(() -> new RuntimeException("Error: User not found with this email."));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otpCode(otp)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .isUsed(false)
                .build();
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(email, otp);
    }

    @Override
    public void verifyOtp(String email, String otp) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpCode(email, otp)
                .orElseThrow(() -> new RuntimeException("Error: Invalid OTP."));

        if (otpToken.getIsUsed()) {
            throw new RuntimeException("Error: OTP has already been used.");
        }
        if (otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Error: OTP has expired.");
        }
        // OTP is valid
    }

    @Override
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu phải có từ 6 ký tự trở lên.");
        }

        String lowercaseEmail = email != null ? email.toLowerCase() : null;
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpCode(lowercaseEmail, otp)
                .orElseThrow(() -> new RuntimeException("Error: Invalid OTP."));

        if (otpToken.getIsUsed() || otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Error: OTP is invalid or expired.");
        }

        User user = userRepository.findByEmail(lowercaseEmail)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        otpToken.setIsUsed(true);
        otpTokenRepository.save(otpToken);
    }

    @Override
    @Transactional
    public JwtResponse googleLogin(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID token. Please try again.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail() != null ? payload.getEmail().toLowerCase() : null;
            String name = (String) payload.get("name");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .email(email)
                        .password(encoder.encode("OAUTH2_USER_" + new Random().nextInt(1000000))) // Random password
                        .fullName(name)
                        .role(Role.ROLE_USER)
                        .rewardPoints(0)
                        .isActive(true)
                        .build();
                return userRepository.save(newUser);
            });

            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = jwtUtils.generateJwtToken(authentication);

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    user.getFullName(),
                    roles);

        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }
}
