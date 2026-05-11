package com.example.digitaldocumentshop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${brevo.from-email:}")
    private String brevoFromEmail;

    @Value("${brevo.from-name:StudyDoc}")
    private String brevoFromName;

    public EmailService(JavaMailSender javaMailSender, ObjectMapper objectMapper) {
        this.javaMailSender = javaMailSender;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendOtpEmail(String toEmail, String otp) {
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendOtpEmailWithBrevo(toEmail, otp);
            return;
        }
        sendOtpEmailWithSmtp(toEmail, otp);
    }

    private void sendOtpEmailWithSmtp(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (mailUsername != null && !mailUsername.isBlank()) {
                message.setFrom(mailUsername);
            }
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

    private void sendOtpEmailWithBrevo(String toEmail, String otp) {
        try {
            String fromEmail = (brevoFromEmail != null && !brevoFromEmail.isBlank()) ? brevoFromEmail : mailUsername;
            if (fromEmail == null || fromEmail.isBlank()) {
                throw new RuntimeException("BREVO_FROM_EMAIL or MAIL_USERNAME is required.");
            }

            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", brevoFromName, "email", fromEmail),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", "Mã OTP Đặt Lại Mật Khẩu - DigiDoc",
                    "textContent", "Xin chào,\n\nMã OTP để đặt lại mật khẩu của bạn là: " + otp
                            + "\n\nMã này sẽ hết hạn trong 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nDigiDoc Team"
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .timeout(Duration.ofSeconds(20))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.error("Brevo email API failed with status {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Brevo email API failed.");
            }

            logger.info("Email sent successfully to {} via Brevo", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email via Brevo API.", e);
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng kiểm tra lại cấu hình dịch vụ gửi email hoặc thử lại sau.");
        }
    }
}
