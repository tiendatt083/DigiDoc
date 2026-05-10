package com.example.digitaldocumentshop.config;

import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.enums.Role;
import com.example.digitaldocumentshop.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "nguyendat20041973@gmail.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .email(adminEmail)
                        .password(passwordEncoder.encode("admin"))
                        .fullName("admin")
                        .phoneNumber("0394566547")
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
