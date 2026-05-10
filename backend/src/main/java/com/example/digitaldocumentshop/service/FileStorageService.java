package com.example.digitaldocumentshop.service;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;

public interface FileStorageService {
    String storeFile(MultipartFile file, String prefix);
    Path loadFileAsResource(String fileName);
}
