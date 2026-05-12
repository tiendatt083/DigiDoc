package com.example.digitaldocumentshop.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StartupLogger {

    private final Environment env;

    public StartupLogger(Environment env) {
        this.env = env;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String port = env.getProperty("server.port", "8080");
        String RESET = "\u001B[0m";
        String GREEN = "\u001B[32m";
        String CYAN = "\u001B[36m";
        String YELLOW = "\u001B[33m";
        String BOLD = "\u001B[1m";

        System.out.println();
        System.out.println(GREEN + "╔══════════════════════════════════════════════════╗" + RESET);
        System.out.println(GREEN + "║" + BOLD + CYAN + "       🚀 DiGiDoc Backend đã khởi động!          " + RESET + GREEN + "║" + RESET);
        System.out.println(GREEN + "╠══════════════════════════════════════════════════╣" + RESET);
        System.out.println(GREEN + "║" + RESET + "  ➜  " + YELLOW + "Local:   " + RESET + BOLD + "http://localhost:" + port + RESET + "                 " + GREEN + "║" + RESET);
        System.out.println(GREEN + "║" + RESET + "  ➜  " + YELLOW + "API:     " + RESET + BOLD + "http://localhost:" + port + "/api" + RESET + "             " + GREEN + "║" + RESET);
        System.out.println(GREEN + "║" + RESET + "  ➜  " + YELLOW + "Database:" + RESET + " digital_document_shop                " + GREEN + "║" + RESET);
        System.out.println(GREEN + "╚══════════════════════════════════════════════════╝" + RESET);
        System.out.println();
    }
}
