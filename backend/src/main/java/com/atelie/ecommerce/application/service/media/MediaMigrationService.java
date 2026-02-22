package com.atelie.ecommerce.application.service.media;

import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetEntity;
import com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.service.media.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaMigrationService {

    private final ProductRepository productRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final CloudinaryService cloudinaryService;

    @Value("${UPLOAD_DIR:/app/uploads}")
    private String uploadDir;

    @Transactional
    public MigrationResult migrateAll() {
        MigrationResult result = new MigrationResult();

        // 1. Migrate Products
        List<ProductEntity> products = productRepository.findAll();
        for (ProductEntity product : products) {
            boolean updated = false;

            // Migrate specific images list
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                List<String> newUrls = new ArrayList<>();
                for (String path : product.getImages()) {
                    if (isLocalPath(path)) {
                        String newUrl = uploadLocalFile(path);
                        if (newUrl != null) {
                            newUrls.add(newUrl);
                            updated = true;
                            result.migratedFiles++;
                        } else {
                            newUrls.add(path); // Keep old if failed
                        }
                    } else {
                        newUrls.add(path);
                    }
                }
                product.setImages(newUrls);
            }

            if (updated) {
                productRepository.save(product);
            }
        }

        // 2. Migrate MediaAssets
        List<MediaAssetEntity> assets = mediaAssetRepository.findAll();
        for (MediaAssetEntity asset : assets) {
            String path = asset.getStorageKey();
            if (isLocalPath(path)) {
                String newUrl = uploadLocalFile(path);
                if (newUrl != null) {
                    asset.setStorageKey(newUrl);
                    mediaAssetRepository.save(asset);
                    result.migratedFiles++;
                }
            }
        }

        return result;
    }

    private boolean isLocalPath(String path) {
        return path != null && !path.startsWith("http") && !path.contains("cloudinary.com");
    }

    private String uploadLocalFile(String filename) {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        if (!Files.exists(filePath)) {
            log.warn("Arquivo local não encontrado para migração: {}", filePath);
            return null;
        }

        try {
            byte[] content = Files.readAllBytes(filePath);
            return cloudinaryService.upload(content);
        } catch (IOException e) {
            log.error("Erro ao ler arquivo local: {}", filename, e);
            return null;
        }
    }

    public static class MigrationResult {
        public int migratedFiles = 0;
    }
}
