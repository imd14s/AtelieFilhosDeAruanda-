package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final MediaStorageService mediaStorageService;

    public ProductController(ProductRepository productRepository,
            ProductService productService,
            MediaStorageService mediaStorageService) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.mediaStorageService = mediaStorageService;
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String q,
            org.springframework.data.domain.Pageable pageable) {

        if (slug != null) {
            return productRepository.findBySlug(slug)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        if (categoryId != null) {
            return ResponseEntity.ok(productRepository.findByCategory_Id(categoryId, pageable));
        }

        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(q, pageable));
        }

        return ResponseEntity.ok(productRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getById(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProductEntity> create(@RequestBody ProductCreateRequest request) {
        if (request.categoryId() == null) {
            return ResponseEntity.badRequest().build();
        }

        ProductEntity product = new ProductEntity();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());

        if (request.media() != null) {
            List<String> imageUrls = request.media().stream()
                    .map(ProductCreateRequest.ProductMediaItem::url)
                    .toList();
            product.setImages(imageUrls);
        }

        if (request.marketplaceIds() != null) {
            product.setMarketplaceIds(request.marketplaceIds());
        }

        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product.setActive(request.active() != null ? request.active() : true);

        // Map variants
        List<com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity> variants = null;
        if (request.variants() != null) {
            variants = request.variants().stream().map(v -> {
                String attrsJson = "{}";
                try {
                    if (v.attributes() != null) {
                        attrsJson = new com.fasterxml.jackson.databind.ObjectMapper()
                                .writeValueAsString(v.attributes());
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }

                return new com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity(
                        null,
                        v.sku(),
                        null,
                        v.price(),
                        v.stock(),
                        attrsJson,
                        true);
            }).toList();
        }

        ProductEntity savedProduct = productService.saveProduct(product, request.categoryId(), variants);

        return ResponseEntity.ok(savedProduct);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            var mediaAsset = mediaStorageService.upload(file, "product-image", true);
            return ResponseEntity.ok(new java.util.HashMap<String, String>() {
                {
                    put("id", mediaAsset.getId().toString());
                    put("url", "/api/media/public/" + mediaAsset.getId());
                }
            });
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Falha no upload: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductEntity> update(@PathVariable UUID id, @RequestBody ProductEntity productDetails) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, productDetails));
        } catch (com.atelie.ecommerce.api.common.exception.NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/toggle-alert")
    public ResponseEntity<Void> toggleAlert(@PathVariable UUID id) {
        try {
            productService.toggleAlert(id);
            return ResponseEntity.ok().build();
        } catch (com.atelie.ecommerce.api.common.exception.NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/generate-description")
    public ResponseEntity<?> generateDescription(@RequestBody java.util.Map<String, String> payload) {
        String title = payload.get("title");
        if (title == null || title.isBlank())
            return ResponseEntity.badRequest().body("Title required");

        try {
            String desc = productService.generateDescription(title);
            return ResponseEntity.ok(java.util.Map.of("description", desc));
        } catch (com.atelie.ecommerce.api.common.exception.BusinessException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", "Erro interno"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
