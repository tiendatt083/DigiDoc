package com.example.digitaldocumentshop.config;

import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.enums.Role;
import com.example.digitaldocumentshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Value("${app.default-admin.email:}")
    private String defaultAdminEmail;

    @Value("${app.default-admin.password:}")
    private String defaultAdminPassword;

    @Value("${app.default-admin.phone:}")
    private String defaultAdminPhone;

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (defaultAdminEmail == null || defaultAdminEmail.isBlank()
                    || defaultAdminPassword == null || defaultAdminPassword.isBlank()) {
                return;
            }

            String adminEmail = defaultAdminEmail.toLowerCase();
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .email(adminEmail)
                        .password(passwordEncoder.encode(defaultAdminPassword))
                        .fullName("admin")
                        .phoneNumber(defaultAdminPhone)
                        .role(Role.ROLE_ADMIN)
                        .isActive(true)
                        .rewardPoints(0)
                        .build();
                userRepository.save(admin);
                System.out.println("Default admin user created successfully!");
            }
        };
    }
}
