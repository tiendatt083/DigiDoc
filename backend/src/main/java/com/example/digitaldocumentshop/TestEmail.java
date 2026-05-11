package com.example.digitaldocumentshop;

import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.SimpleMailMessage;
import java.util.Properties;

public class TestEmail {
    public static void main(String[] args) {
        String mailUsername = System.getenv("MAIL_USERNAME");
        String mailPassword = System.getenv("MAIL_PASSWORD");

        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            System.out.println("FAILED TO SEND EMAIL:");
            System.out.println("Please set MAIL_USERNAME and MAIL_PASSWORD before running this test.");
            return;
        }

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(mailUsername);
            message.setSubject("Test");
            message.setText("Test message");

            mailSender.send(message);
            System.out.println("SUCCESSFULLY SENT EMAIL!");
        } catch (Exception e) {
            System.out.println("FAILED TO SEND EMAIL:");
            e.printStackTrace();
        }
    }
}
