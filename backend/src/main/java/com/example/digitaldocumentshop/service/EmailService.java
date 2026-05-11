package com.example.digitaldocumentshop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final String mailUsername;
    private final String mailPassword;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public EmailService(JavaMailSender javaMailSender,
                        @Value("${spring.mail.username:}") String mailUsername,
                        @Value("${spring.mail.password:}") String mailPassword) {
        this.javaMailSender = javaMailSender;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        if (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(mailPassword)) {
            throw new RuntimeException("Chưa cấu hình MAIL_USERNAME hoặc MAIL_PASSWORD cho SMTP.");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(toEmail);
            message.setSubject("Mã OTP Đặt Lại Mật Khẩu - DigiDoc");
            message.setText("Xin chào,\n\nMã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n\nMã này sẽ hết hạn trong 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nDigiDoc Team");

            // Attempt to send email. If it fails due to config, it will be caught.
            javaMailSender.send(message);
            logger.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {} using SMTP account {}.", toEmail, mailUsername, e);
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng kiểm tra lại MAIL_USERNAME/MAIL_PASSWORD và Gmail App Password.", e);
        }
    }
}
