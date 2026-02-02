package com.atelie.ecommerce.infrastructure.service.media;

import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetEntity;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetRepository;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetType;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MediaStorageService {

    private final MediaAssetRepository repo;
    private final Environment env;

    public MediaStorageService(MediaAssetRepository repo, Environment env) {
        this.repo = repo;
        this.env = env;
    }

    public MediaAssetEntity upload(MultipartFile file, String type, boolean isPublic) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("file is required");

        MediaAssetType assetType = parseType(type);

        long maxBytes = maxUploadBytes();
        if (file.getSize() > maxBytes) throw new IllegalArgumentException("file too large");

        String mime = normalizeMime(file.getContentType());
        ensureAllowedMime(assetType, mime);

        String ext = safeExtensionFromMime(mime);
        String uuid = UUID.randomUUID().toString();
        String storageKey = "media/" + uuid + ext;

        Path baseDir = Paths.get(env.getProperty("UPLOAD_DIR", "/app/uploads")).toAbsolutePath().normalize();
        Path target = baseDir.resolve(storageKey).normalize();
        if (!target.startsWith(baseDir)) throw new IllegalStateException("invalid storage path");

        try {
            Files.createDirectories(target.getParent());

            String sha = sha256Hex(file.getInputStream());

            Path tmp = Files.createTempFile(target.getParent(), "upload-", ".tmp");
            Files.copy(file.getInputStream(), tmp, StandardCopyOption.REPLACE_EXISTING);
            Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);

            MediaAssetEntity entity = new MediaAssetEntity();
            entity.setType(assetType);
            entity.setStorageKey(storageKey);
            entity.setOriginalFilename(safeOriginalName(file.getOriginalFilename()));
            entity.setMimeType(mime);
            entity.setSizeBytes(file.getSize());
            entity.setChecksumSha256(sha);
            entity.setPublic(isPublic);

            return repo.save(entity);
        } catch (Exception e) {
            throw new RuntimeException("failed to store media", e);
        }
    }

    public Optional<MediaDownload> loadPublic(long id) {
        return repo.findById(id).filter(MediaAssetEntity::isPublic).flatMap(this::loadEntity);
    }

    private Optional<MediaDownload> loadEntity(MediaAssetEntity entity) {
        Path baseDir = Paths.get(env.getProperty("UPLOAD_DIR", "/app/uploads")).toAbsolutePath().normalize();
        Path target = baseDir.resolve(entity.getStorageKey()).normalize();
        if (!target.startsWith(baseDir)) return Optional.empty();
        if (!Files.exists(target) || !Files.isRegularFile(target)) return Optional.empty();
        return Optional.of(new MediaDownload(target, entity.getMimeType(), entity.getSizeBytes()));
    }

    private MediaAssetType parseType(String raw) {
        if (raw == null) throw new IllegalArgumentException("type is required (IMAGE|VIDEO)");
        try { return MediaAssetType.valueOf(raw.trim().toUpperCase(Locale.ROOT)); }
        catch (Exception e) { throw new IllegalArgumentException("invalid type (IMAGE|VIDEO)"); }
    }

    private long maxUploadBytes() {
        String mbRaw = env.getProperty("MAX_UPLOAD_MB", "30").trim();
        long mb = Long.parseLong(mbRaw);
        if (mb < 1) mb = 1;
        return mb * 1024L * 1024L;
    }

    private String normalizeMime(String ct) {
        if (!StringUtils.hasText(ct)) return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ct.trim().toLowerCase(Locale.ROOT);
    }

    private void ensureAllowedMime(MediaAssetType type, String mime) {
        Set<String> allowed = allowedMimes(type);
        if (!allowed.contains(mime)) throw new IllegalArgumentException("mime not allowed: " + mime);
    }

    private Set<String> allowedMimes(MediaAssetType type) {
        String raw = (type == MediaAssetType.IMAGE)
            ? env.getProperty("ALLOWED_IMAGE_MIME", "image/jpeg,image/png,image/webp")
            : env.getProperty("ALLOWED_VIDEO_MIME", "video/mp4,video/webm");

        return Arrays.stream(raw.split(","))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .map(s -> s.toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());
    }

    private String safeExtensionFromMime(String mime) {
        return switch (mime) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "video/mp4" -> ".mp4";
            case "video/webm" -> ".webm";
            default -> "";
        };
    }

    private String safeOriginalName(String original) {
        if (original == null) return null;
        String name = original.replace("\\", "/");
        name = name.substring(name.lastIndexOf('/') + 1);
        name = name.replaceAll("[^A-Za-z0-9._-]", "_");
        if (name.length() > 120) name = name.substring(name.length() - 120);
        return name;
    }

    private static String sha256Hex(InputStream in) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] buf = new byte[8192];
        int r;
        while ((r = in.read(buf)) > 0) md.update(buf, 0, r);
        byte[] dig = md.digest();
        StringBuilder sb = new StringBuilder();
        for (byte b : dig) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    public record MediaDownload(Path path, String mimeType, long sizeBytes) {}
}
