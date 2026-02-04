package com.atelie.ecommerce.infrastructure.service.media;

import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetRepository;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetEntity;
import org.springframework.core.env.Environment;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Method;
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

        MediaAssetEntity asset = instantiate(MediaAssetEntity.class);

        // Preenche best-effort (nomes variam no seu entity)
        trySet(asset, "setFilename", filename);
        trySet(asset, "setFileName", filename);

        trySet(asset, "setContentType", file.getContentType());
        trySet(asset, "setMimeType", file.getContentType());

        trySet(asset, "setSizeBytes", file.getSize());
        trySet(asset, "setSize", file.getSize());

        trySet(asset, "setCategory", category);

        trySet(asset, "setPublic", isPublic);
        trySet(asset, "setIsPublic", isPublic);
        trySet(asset, "setPublicAsset", isPublic);

        // Seu erro mostrou Instant, então usamos Instant.
        trySet(asset, "setCreatedAt", Instant.now());

        return repo.save(asset);
    }

    /** Usado por MediaController: ele trata como Optional<Resource> */
    public Optional<Resource> loadPublic(long id) {
        Optional<MediaAssetEntity> opt = repo.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        MediaAssetEntity asset = opt.get();

        Boolean pub = tryGetBoolean(asset, "getPublic", "isPublic", "getIsPublic", "isPublicAsset", "getPublicAsset");
        if (pub != null && !pub) return Optional.empty();

        String filename = tryGetString(asset, "getFilename", "getFileName");
        if (filename == null || filename.isBlank()) return Optional.empty();

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
        String ct = file.getContentType();
        if (ct == null || !allowedImageMime.contains(ct)) {
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

    // ---------------- reflection helpers ----------------

    private static <T> T instantiate(Class<T> clazz) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot instantiate " + clazz.getName() + " (no default constructor?)", e);
        }
    }

    private static void trySet(Object target, String methodName, Object value) {
        if (target == null || value == null) return;
        try {
            Method m = findSetter(target.getClass(), methodName, value.getClass());
            if (m != null) m.invoke(target, value);
        } catch (Exception ignored) { }
    }

    private static Method findSetter(Class<?> clazz, String name, Class<?> paramType) {
        try {
            return clazz.getMethod(name, paramType);
        } catch (NoSuchMethodException e) {
            for (Method m : clazz.getMethods()) {
                if (!m.getName().equals(name)) continue;
                if (m.getParameterCount() != 1) continue;
                if (m.getParameterTypes()[0].isAssignableFrom(paramType)) return m;
            }
            return null;
        }
    }

    private static Boolean tryGetBoolean(Object target, String... methodNames) {
        for (String n : methodNames) {
            try {
                Method m = target.getClass().getMethod(n);
                Object v = m.invoke(target);
                if (v instanceof Boolean b) return b;
            } catch (Exception ignored) { }
        }
        return null;
    }

    private static String tryGetString(Object target, String... methodNames) {
        for (String n : methodNames) {
            try {
                Method m = target.getClass().getMethod(n);
                Object v = m.invoke(target);
                if (v != null) return String.valueOf(v);
            } catch (Exception ignored) { }
        }
        return null;
    }
}
