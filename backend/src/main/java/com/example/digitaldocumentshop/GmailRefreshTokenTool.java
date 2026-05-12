package com.example.digitaldocumentshop;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.awt.Desktop;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class GmailRefreshTokenTool {

    private static final String SCOPE = "https://www.googleapis.com/auth/gmail.send";
    private static final String REDIRECT_URI = "http://localhost:8081/oauth2callback";

    public static void main(String[] args) throws Exception {
        String clientId = requireEnv("GMAIL_CLIENT_ID");
        String clientSecret = requireEnv("GMAIL_CLIENT_SECRET");

        ArrayBlockingQueue<String> codeQueue = new ArrayBlockingQueue<>(1);
        HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 8081), 0);
        server.createContext("/oauth2callback", exchange -> handleCallback(exchange, codeQueue));
        server.start();

        String authUrl = "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + urlEncode(clientId)
                + "&redirect_uri=" + urlEncode(REDIRECT_URI)
                + "&response_type=code"
                + "&scope=" + urlEncode(SCOPE)
                + "&access_type=offline"
                + "&prompt=consent";

        System.out.println("Open this URL and approve Gmail send access:");
        System.out.println(authUrl);
        openBrowser(authUrl);

        try {
            String code = codeQueue.poll(5, TimeUnit.MINUTES);
            if (code == null) {
                throw new IllegalStateException("Timed out waiting for Google OAuth callback.");
            }

            JsonNode tokenResponse = exchangeCodeForTokens(clientId, clientSecret, code);
            String refreshToken = tokenResponse.path("refresh_token").asText();
            if (refreshToken == null || refreshToken.isBlank()) {
                System.out.println(tokenResponse.toPrettyString());
                throw new IllegalStateException("No refresh_token returned. Revoke the app access in Google Account, then run this tool again.");
            }

            System.out.println();
            System.out.println("Copy these values into Render Environment:");
            System.out.println("EMAIL_PROVIDER=gmail-api");
            System.out.println("MAIL_FROM=<your authorized Gmail address>");
            System.out.println("GMAIL_CLIENT_ID=" + clientId);
            System.out.println("GMAIL_CLIENT_SECRET=" + clientSecret);
            System.out.println("GMAIL_REFRESH_TOKEN=" + refreshToken);
        } finally {
            server.stop(0);
        }
    }

    private static void handleCallback(HttpExchange exchange, ArrayBlockingQueue<String> codeQueue) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String code = query.get("code");
        String error = query.get("error");

        String response;
        if (code != null && !code.isBlank()) {
            codeQueue.offer(code);
            response = "Gmail authorization received. You can close this tab and return to the terminal.";
        } else {
            response = "Missing authorization code. Error: " + (error == null ? "unknown" : error);
        }

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static JsonNode exchangeCodeForTokens(String clientId, String clientSecret, String code)
            throws IOException, InterruptedException {
        String body = formEncode(Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "code", code,
                "grant_type", "authorization_code",
                "redirect_uri", REDIRECT_URI
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("User-Agent", "DiGiDocTokenTool/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode json = objectMapper.readTree(response.body());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Token exchange failed: " + json.toPrettyString());
        }
        return json;
    }

    private static String requireEnv(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing environment variable: " + name);
        }
        return value;
    }

    private static void openBrowser(String url) {
        try {
            if (Desktop.isDesktopSupported()) {
                Desktop.getDesktop().browse(URI.create(url));
            }
        } catch (Exception ignored) {
            // The URL is printed above for manual opening.
        }
    }

    private static String formEncode(Map<String, String> values) {
        return values.entrySet().stream()
                .map(entry -> urlEncode(entry.getKey()) + "=" + urlEncode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static Map<String, String> parseQuery(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return Map.of();
        }
        return Arrays.stream(rawQuery.split("&"))
                .map(part -> part.split("=", 2))
                .collect(Collectors.toMap(
                        part -> urlDecode(part[0]),
                        part -> part.length > 1 ? urlDecode(part[1]) : "",
                        (left, right) -> right
                ));
    }

    private static String urlDecode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
