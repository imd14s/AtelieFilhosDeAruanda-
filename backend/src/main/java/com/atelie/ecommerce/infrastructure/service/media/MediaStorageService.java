package com.atelie.ecommerce.infrastructure.service.media;

import com.atelie.ecommerce.application.common.util.ReflectionPropertyUtils;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetRepository;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetEntity;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetType;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.Instant;
import java.util.*;

@Service
public class MediaStorageService {

    private final MediaAssetRepository repo;
    private final CloudinaryService cloudinaryService;
    private final long maxUploadBytes;
    private final List<String> allowedImageMime;

    public MediaStorageService(MediaAssetRepository repo, CloudinaryService cloudinaryService, Environment env) {
        this.repo = repo;
        this.cloudinaryService = cloudinaryService;
        this.maxUploadBytes = Long.parseLong(requireEnv(env, "MAX_UPLOAD_MB", "50")) * 1024L * 1024L;
        this.allowedImageMime = Arrays
                .asList(requireEnv(env, "ALLOWED_IMAGE_MIME", "image/png,image/jpeg,image/webp,video/mp4").split(","));
    }

    /** Usado por FileStorageService e ProductImageController */
    public String storeImage(MultipartFile file) {
        validateImage(file);
        return cloudinaryService.upload(file);
    }

    /** Usado por MediaController */
    public MediaAssetEntity upload(MultipartFile file, String category, boolean isPublic) {
        String secureUrl = storeImage(file);

        // Check for existing asset with the same storageKey to avoid unique constraint
        // violations
        return repo.findByStorageKey(secureUrl).orElseGet(() -> {
            MediaAssetEntity asset = ReflectionPropertyUtils.instantiate(MediaAssetEntity.class);

            asset.setStorageKey(secureUrl);
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
        });
    }

    /**
     * Carrega o recurso. Se for uma URL externa, faz o download do conteúdo.
     */
    public Optional<org.springframework.core.io.Resource> loadPublic(long id) {
        return getUrl(id).map(url -> {
            try {
                byte[] bytes = new java.net.URL(url).openStream().readAllBytes();
                return new org.springframework.core.io.ByteArrayResource(bytes, "media-" + id);
            } catch (java.io.IOException e) {
                return null;
            }
        });
    }

    /**
     * Nota: O carregamento de recursos locais via FileSystemResource é desativado
     * em favor de URLs diretas do Cloudinary.
     */
    public Optional<String> getUrl(long id) {
        return repo.findById(id).map(MediaAssetEntity::getStorageKey);
    }

    // ---------------- validation ----------------

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > maxUploadBytes) {
            throw new IllegalArgumentException("File exceeds MAX_UPLOAD_MB");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return;
        }

        String ct = file.getContentType();
        if (ct == null || !allowedImageMime.contains(ct)) {
            throw new IllegalArgumentException(
                    "Tipo de arquivo não permitido: " + ct + ". Permitidos: " + allowedImageMime);
        }
    }

    private static String requireEnv(Environment env, String key, String defaultValue) {
        String value = env.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        return value.trim();
    }
}
