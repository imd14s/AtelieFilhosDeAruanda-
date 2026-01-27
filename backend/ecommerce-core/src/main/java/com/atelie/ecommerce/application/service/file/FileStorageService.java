package com.atelie.ecommerce.application.service.file;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path root = Paths.get("./uploads");

    public FileStorageService() {
        try { Files.createDirectories(root); } 
        catch (IOException e) { throw new RuntimeException("Could not initialize folder for upload!"); }
    }

    public String save(MultipartFile file) {
        try {
            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID().toString() + "." + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int i = filename.lastIndexOf('.');
        return i > 0 ? filename.substring(i + 1) : "";
    }
}
