package com.atelie.ecommerce.api.catalog.product.image;

import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/image")
public class ProductImageController {

    private final ProductRepository productRepository;
    private final MediaStorageService mediaStorageService;

    public ProductImageController(ProductRepository productRepository,
                                  MediaStorageService mediaStorageService) {
        this.productRepository = productRepository;
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping
    public ResponseEntity<String> uploadImage(@PathVariable UUID productId,
                                              @RequestParam("file") MultipartFile file) {

        productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        String filename = mediaStorageService.storeImage(file);
        return ResponseEntity.ok(filename);
    }
}
