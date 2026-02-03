package com.atelie.ecommerce.infrastructure.service.media;

import com.atelie.ecommerce.infrastructure.repository.media.MediaAssetRepository;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MediaStorageService {

    private final Path uploadDir;
    private final long maxUploadBytes;
    private final List<String> allowedImageMime;

    public MediaStorageService(MediaAssetRepository repo, Environment env) {
        // Em produção, nada crítico pode ser "adivinhado" via fallback hardcoded.
        // Portanto, estas ENV são obrigatórias:
        // - UPLOAD_DIR
        // - MAX_UPLOAD_MB
        // - ALLOWED_IMAGE_MIME
        this.uploadDir = Paths.get(requireEnv(env, "UPLOAD_DIR"));
        this.maxUploadBytes = parseMaxUploadBytes(requireEnv(env, "MAX_UPLOAD_MB"));
        this.allowedImageMime = parseMimeList(requireEnv(env, "ALLOWED_IMAGE_MIME"));

        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create upload directory: " + uploadDir, e);
        }
    }

    public String storeImage(MultipartFile file) {
        validateImage(file);

        String extension = extractExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;

        Path target = uploadDir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file: " + filename, e);
        }

        return filename;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxUploadBytes) {
            throw new IllegalArgumentException("File exceeds MAX_UPLOAD_MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedImageMime.contains(contentType)) {
            throw new IllegalArgumentException("Invalid mime type. Allowed: " + allowedImageMime);
        }
    }

    private static String extractExtension(String name) {
        if (name == null || !name.contains(".")) return "";
        return name.substring(name.lastIndexOf("."));
    }

    private static String requireEnv(Environment env, String key) {
        String value = env.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("Missing required ENV: " + key);
        }
        return value.trim();
    }

    private static long parseMaxUploadBytes(String maxMbRaw) {
        try {
            long mb = Long.parseLong(maxMbRaw.trim());
            if (mb <= 0) {
                throw new IllegalStateException("MAX_UPLOAD_MB must be > 0");
            }
            return mb * 1024L * 1024L;
        } catch (NumberFormatException e) {
            throw new IllegalStateException("MAX_UPLOAD_MB must be a number", e);
        }
    }

    private static List<String> parseMimeList(String raw) {
        List<String> list = Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        if (list.isEmpty()) {
            throw new IllegalStateException("ALLOWED_IMAGE_MIME cannot be empty");
        }
        return list;
    }
}
