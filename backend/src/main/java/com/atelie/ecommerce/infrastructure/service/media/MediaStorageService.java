package com.atelie.ecommerce.infrastructure.service.media;

import com.atelie.ecommerce.infrastructure.repository.media.MediaAssetRepository;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path uploadDir;
    private final long maxUploadBytes;
    private final List<String> allowedImageMime;

    public MediaStorageService(MediaAssetRepository repo, Environment env) {
        this.uploadDir = Paths.get(env.getProperty("UPLOAD_DIR", "/app/uploads"));
        this.maxUploadBytes = Long.parseLong(
                env.getProperty("MAX_UPLOAD_MB", "10")
        ) * 1024 * 1024;

        this.allowedImageMime = List.of(
                env.getProperty("ALLOWED_IMAGE_MIME", "image/png,image/jpeg").split(",")
        );

        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create upload directory", e);
        }
    }

    public String storeImage(MultipartFile file) {
        validate(file);

        String extension = extractExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;

        Path target = uploadDir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }

        return filename;
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxUploadBytes) {
            throw new IllegalArgumentException("File exceeds max size");
        }

        if (!allowedImageMime.contains(file.getContentType())) {
            throw new IllegalArgumentException("Invalid mime type");
        }
    }

    private String extractExtension(String name) {
        if (name == null || !name.contains(".")) return "";
        return name.substring(name.lastIndexOf("."));
    }
}
