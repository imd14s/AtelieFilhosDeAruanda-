package com.atelie.ecommerce.application.service.fiscal;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ReportStorageService {

    private final Path root = Paths.get("temp_reports");

    public ReportStorageService() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível inicializar diretório de relatórios", e);
        }
    }

    public String save(byte[] content, UUID reportId, String extension) throws IOException {
        String filename = reportId.toString() + "." + extension.toLowerCase();
        Path file = root.resolve(filename);
        Files.write(file, content);
        return filename;
    }

    public byte[] load(String filename) throws IOException {
        Path file = root.resolve(filename);
        return Files.readAllBytes(file);
    }
}
