package com.example.digitaldocumentshop.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
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
    private final String mailUsername;
    private final String mailPassword;
    private final String emailProvider;
    private final String emailFrom;
    private final String resendApiKey;
    private final HttpClient httpClient;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public EmailService(JavaMailSender javaMailSender,
                        ObjectMapper objectMapper,
                        @Value("${spring.mail.username:}") String mailUsername,
                        @Value("${spring.mail.password:}") String mailPassword,
                        @Value("${app.email.provider:smtp}") String emailProvider,
                        @Value("${app.email.from:}") String emailFrom,
                        @Value("${resend.api-key:}") String resendApiKey) {
        this.javaMailSender = javaMailSender;
        this.objectMapper = objectMapper;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
        this.emailProvider = emailProvider;
        this.emailFrom = StringUtils.hasText(emailFrom) ? emailFrom : mailUsername;
        this.resendApiKey = resendApiKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Mã OTP Đặt Lại Mật Khẩu - DigiDoc";
        String text = "Xin chào,\n\nMã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n\nMã này sẽ hết hạn trong 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nDigiDoc Team";

        if ("resend".equalsIgnoreCase(emailProvider)) {
            sendWithResend(toEmail, subject, text);
            return;
        }

        sendWithSmtp(toEmail, subject, text);
    }

    private void sendWithSmtp(String toEmail, String subject, String text) {
        if (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(mailPassword)) {
            throw new RuntimeException("Chưa cấu hình MAIL_USERNAME hoặc MAIL_PASSWORD cho SMTP.");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailFrom);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(text);

            // Attempt to send email. If it fails due to config, it will be caught.
            javaMailSender.send(message);
            logger.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {} using SMTP account {}.", toEmail, mailUsername, e);
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng kiểm tra lại MAIL_USERNAME/MAIL_PASSWORD và Gmail App Password.", e);
        }
    }

    private void sendWithResend(String toEmail, String subject, String text) {
        if (!StringUtils.hasText(resendApiKey)) {
            throw new RuntimeException("Chưa cấu hình RESEND_API_KEY cho email provider Resend.");
        }
        if (!StringUtils.hasText(emailFrom)) {
            throw new RuntimeException("Chưa cấu hình MAIL_FROM cho email provider Resend.");
        }

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "from", emailFrom,
                    "to", List.of(toEmail),
                    "subject", subject,
                    "text", text
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "DigiDocBackend/1.0")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.error("Resend failed to send OTP email to {}. Status: {}. Body: {}",
                        toEmail, response.statusCode(), response.body());
                throw new RuntimeException("Không thể gửi email OTP qua Resend. Vui lòng kiểm tra RESEND_API_KEY và MAIL_FROM.");
            }

            logger.info("OTP email sent successfully to {} using Resend.", toEmail);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Không thể tạo nội dung email OTP.", e);
        } catch (IOException e) {
            logger.error("Network error while sending OTP email to {} using Resend.", toEmail, e);
            throw new RuntimeException("Không thể kết nối Resend để gửi email OTP.", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Quá trình gửi email OTP bị gián đoạn.", e);
        }
    }
}
