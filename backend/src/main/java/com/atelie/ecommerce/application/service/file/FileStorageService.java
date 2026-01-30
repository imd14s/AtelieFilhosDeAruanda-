package com.atelie.ecommerce.application.service.file;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * FileStorageService
 *
 * Regras de segurança:
 * - Bloqueia upload vazio
 * - Limita tamanho máximo (default 5MB)
 * - Permite apenas extensões conhecidas
 * - Gera nome novo (UUID) para impedir path traversal/colisão
 */
@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L; // 5MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp", "gif");

    private final Path root = Paths.get("./uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível inicializar a pasta de upload.", e);
        }
    }

    public String save(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo inválido (vazio).");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Arquivo excede o tamanho máximo permitido (5MB).");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new SecurityException("Tipo de arquivo não permitido: " + extension);
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path destination = root.resolve(filename).normalize();

        // Garante que o arquivo final está dentro de /uploads
        if (!destination.startsWith(root.normalize())) {
            throw new SecurityException("Caminho de upload inválido.");
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao salvar arquivo.", e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int i = filename.lastIndexOf('.');
        return i > 0 ? filename.substring(i + 1) : "";
    }
}
