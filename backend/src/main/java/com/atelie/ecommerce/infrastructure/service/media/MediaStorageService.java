package com.atelie.ecommerce.infrastructure.service.media;

import com.atelie.ecommerce.api.common.util.ReflectionPropertyUtils;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetRepository;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetEntity;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetType;
import org.springframework.core.env.Environment;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;

@Service
public class MediaStorageService {

    private final MediaAssetRepository repo;
    private final Path uploadDir;
    private final long maxUploadBytes;
    private final List<String> allowedImageMime;

    public MediaStorageService(MediaAssetRepository repo, Environment env) {
        this.repo = repo;
        this.uploadDir = Paths.get(requireEnv(env, "UPLOAD_DIR"));
        this.maxUploadBytes = Long.parseLong(requireEnv(env, "MAX_UPLOAD_MB")) * 1024L * 1024L;
        this.allowedImageMime = Arrays.asList(requireEnv(env, "ALLOWED_IMAGE_MIME").split(","));

        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create upload directory: " + uploadDir, e);
        }
    }

    /** Usado por FileStorageService e ProductImageController */
    public String storeImage(MultipartFile file) {
        validateImage(file);
        String filename = UUID.randomUUID() + extractExtension(file.getOriginalFilename());
        Path target = uploadDir.resolve(filename);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file: " + filename, e);
        }
        return filename;
    }

    /** Usado por MediaController */
    public MediaAssetEntity upload(MultipartFile file, String category, boolean isPublic) {
        String filename = storeImage(file);

        MediaAssetEntity asset = ReflectionPropertyUtils.instantiate(MediaAssetEntity.class);

        asset.setStorageKey(filename);
        asset.setOriginalFilename(file.getOriginalFilename());
        asset.setMimeType(file.getContentType());
        asset.setSizeBytes(file.getSize());
        asset.setPublic(isPublic);
        asset.setCreatedAt(Instant.now());

        // Determine type explicitly
        MediaAssetType type = MediaAssetType.IMAGE;
        if (file.getContentType() != null && file.getContentType().startsWith("video/")) {
            type = MediaAssetType.VIDEO;
        }
        asset.setType(type);

        return repo.save(asset);
    }

    /** Usado por MediaController: ele trata como Optional<Resource> */
    public Optional<Resource> loadPublic(long id) {
        Optional<MediaAssetEntity> opt = repo.findById(id);
        if (opt.isEmpty())
            return Optional.empty();

        MediaAssetEntity asset = opt.get();

        Boolean pub = ReflectionPropertyUtils.tryGetBoolean(asset, "getPublic", "isPublic", "getIsPublic",
                "isPublicAsset", "getPublicAsset");
        if (pub != null && !pub)
            return Optional.empty();

        String filename = ReflectionPropertyUtils.tryGetString(asset, "getFilename", "getFileName");
        if (filename == null || filename.isBlank())
            return Optional.empty();

        Path path = uploadDir.resolve(filename);
        return Optional.of(new FileSystemResource(path));
    }

    // ---------------- validation ----------------

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > maxUploadBytes) {
            throw new IllegalArgumentException("File exceeds MAX_UPLOAD_MB");
        }

        // Bypass validation for ADMINS as requested: "dashboard-admin ... não precisa
        // de validação"
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return;
        }

        String ct = file.getContentType();
        if (ct == null || !allowedImageMime.contains(ct)) {
            // Se for vídeo e o tipo mime começar com video/, permitimos se estiver na lista
            // ou se for um fallback seguro
            // Mas aqui seguimos estritamente a lista do ENV para segurança, que agora
            // inclui videos.
            throw new IllegalArgumentException(
                    "Tipo de arquivo não permitido: " + ct + ". Permitidos: " + allowedImageMime);
        }
    }

    private static String extractExtension(String name) {
        if (name == null || !name.contains("."))
            return "";
        return name.substring(name.lastIndexOf("."));
    }

    private static String requireEnv(Environment env, String key) {
        String value = env.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("Missing required ENV: " + key);
        }
        return value.trim();
    }
}
