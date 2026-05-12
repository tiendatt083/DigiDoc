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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final ObjectMapper objectMapper;
    private final String mailUsername;
    private final String mailPassword;
    private final String emailProvider;
    private final String emailFrom;
    private final String resendApiKey;
    private final String gmailClientId;
    private final String gmailClientSecret;
    private final String gmailRefreshToken;
    private final HttpClient httpClient;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public EmailService(JavaMailSender javaMailSender,
                        ObjectMapper objectMapper,
                        @Value("${spring.mail.username:}") String mailUsername,
                        @Value("${spring.mail.password:}") String mailPassword,
                        @Value("${app.email.provider:smtp}") String emailProvider,
                        @Value("${app.email.from:}") String emailFrom,
                        @Value("${resend.api-key:}") String resendApiKey,
                        @Value("${gmail.client-id:}") String gmailClientId,
                        @Value("${gmail.client-secret:}") String gmailClientSecret,
                        @Value("${gmail.refresh-token:}") String gmailRefreshToken) {
        this.javaMailSender = javaMailSender;
        this.objectMapper = objectMapper;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
        this.emailProvider = emailProvider;
        this.emailFrom = StringUtils.hasText(emailFrom) ? emailFrom : mailUsername;
        this.resendApiKey = resendApiKey;
        this.gmailClientId = gmailClientId;
        this.gmailClientSecret = gmailClientSecret;
        this.gmailRefreshToken = gmailRefreshToken;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Mã OTP Đặt Lại Mật Khẩu - DiGiDoc";
        String text = "Xin chào,\n\nMã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n\nMã này sẽ hết hạn trong 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nDiGiDoc Team";

        if ("resend".equalsIgnoreCase(emailProvider)) {
            sendWithResend(toEmail, subject, text);
            return;
        }
        if ("gmail-api".equalsIgnoreCase(emailProvider)) {
            sendWithGmailApi(toEmail, subject, text);
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
                    .header("User-Agent", "DiGiDocBackend/1.0")
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

    private void sendWithGmailApi(String toEmail, String subject, String text) {
        if (!StringUtils.hasText(gmailClientId)
                || !StringUtils.hasText(gmailClientSecret)
                || !StringUtils.hasText(gmailRefreshToken)) {
            throw new RuntimeException("Chưa cấu hình GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET hoặc GMAIL_REFRESH_TOKEN.");
        }
        if (!StringUtils.hasText(emailFrom)) {
            throw new RuntimeException("Chưa cấu hình MAIL_FROM cho Gmail API.");
        }

        try {
            String accessToken = getGmailAccessToken();
            String rawMessage = createGmailRawMessage(toEmail, subject, text);
            String body = objectMapper.writeValueAsString(Map.of("raw", rawMessage));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages/send"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "DiGiDocBackend/1.0")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.error("Gmail API failed to send OTP email to {}. Status: {}. Body: {}",
                        toEmail, response.statusCode(), response.body());
                throw new RuntimeException("Không thể gửi email OTP qua Gmail API. Vui lòng kiểm tra Gmail OAuth env.");
            }

            logger.info("OTP email sent successfully to {} using Gmail API.", toEmail);
        } catch (MessagingException | JsonProcessingException e) {
            throw new RuntimeException("Không thể tạo nội dung email OTP cho Gmail API.", e);
        } catch (IOException e) {
            logger.error("Network error while sending OTP email to {} using Gmail API.", toEmail, e);
            throw new RuntimeException("Không thể kết nối Gmail API để gửi email OTP.", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Quá trình gửi email OTP qua Gmail API bị gián đoạn.", e);
        }
    }

    private String getGmailAccessToken() throws IOException, InterruptedException {
        String body = formEncode(Map.of(
                "client_id", gmailClientId,
                "client_secret", gmailClientSecret,
                "refresh_token", gmailRefreshToken,
                "grant_type", "refresh_token"
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("User-Agent", "DiGiDocBackend/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            logger.error("Gmail OAuth token refresh failed. Status: {}. Body: {}",
                    response.statusCode(), response.body());
            throw new RuntimeException("Không thể refresh Gmail access token. Vui lòng kiểm tra GMAIL_REFRESH_TOKEN.");
        }

        String accessToken = objectMapper.readTree(response.body()).path("access_token").asText();
        if (!StringUtils.hasText(accessToken)) {
            throw new RuntimeException("Gmail OAuth response không có access_token.");
        }
        return accessToken;
    }

    private String createGmailRawMessage(String toEmail, String subject, String text)
            throws MessagingException, IOException {
        MimeMessage email = new MimeMessage(Session.getInstance(new Properties()));
        email.setFrom(new InternetAddress(emailFrom));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(toEmail));
        email.setSubject(subject, StandardCharsets.UTF_8.name());
        email.setText(text, StandardCharsets.UTF_8.name());

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer.toByteArray());
    }

    private String formEncode(Map<String, String> values) {
        return values.entrySet().stream()
                .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8)
                        + "="
                        + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }
}
