package com.atelie.ecommerce.api.catalog.product.image;

import com.atelie.ecommerce.domain.catalog.product.ProductEntity;
import com.atelie.ecommerce.domain.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
public class ProductImageController {

    private final ProductRepository productRepository;
    private final MediaStorageService mediaStorageService;

    public ProductImageController(ProductRepository productRepository,
                                  MediaStorageService mediaStorageService) {
        this.productRepository = productRepository;
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        String filename = mediaStorageService.storeImage(file);
        product.setImage(filename);
        productRepository.save(product);

        return ResponseEntity.ok().build();
    }
}
