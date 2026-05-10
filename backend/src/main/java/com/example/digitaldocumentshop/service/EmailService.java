package com.example.digitaldocumentshop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@digitaldocumentshop.com");
            message.setTo(toEmail);
            message.setSubject("Mã OTP Đặt Lại Mật Khẩu - DigiDoc");
            message.setText("Xin chào,\n\nMã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n\nMã này sẽ hết hạn trong 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nDigiDoc Team");

            // Attempt to send email. If it fails due to config, it will be caught.
            javaMailSender.send(message);
            logger.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email. Ensure SMTP is configured.", e);
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng kiểm tra lại cấu hình SMTP hoặc thử lại sau.");
        }
    }
}
