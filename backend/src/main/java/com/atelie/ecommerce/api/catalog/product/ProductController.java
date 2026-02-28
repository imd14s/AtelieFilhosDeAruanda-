package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import com.atelie.ecommerce.application.common.exception.BusinessException;
import com.atelie.ecommerce.application.common.exception.NotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.ArrayList;
import java.util.stream.Collectors;

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
            @RequestParam(required = false) String marketplace,
            org.springframework.data.domain.Pageable pageable) {

        if (slug != null) {
            return productRepository.findBySlug(slug)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(q, pageable));
        }

        if (marketplace != null && !marketplace.isBlank()) {
            if (categoryId != null) {
                return ResponseEntity.ok(productRepository
                        .findByMarketplaces_CodeAndCategory_IdAndActiveTrue(marketplace, categoryId, pageable));
            }
            return ResponseEntity.ok(productRepository.findByMarketplaces_CodeAndActiveTrue(marketplace, pageable));
        }

        if (categoryId != null) {
            return ResponseEntity.ok(productRepository.findByCategory_Id(categoryId, pageable));
        }

        return ResponseEntity.ok(productRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getById(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> create(
            @RequestPart("product") ProductCreateRequest request,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {

        validateRequest(request);

        ProductEntity product = mapRequestToEntity(request);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product.setActive(request.active() != null ? request.active() : true);

        List<com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity> variants = mapVariants(
                request.variants());

        ProductEntity savedProduct = productService.saveProduct(product, request.categoryId(), variants, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> update(
            @PathVariable UUID id,
            @RequestPart("product") ProductCreateRequest request,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {

        validateRequest(request);

        ProductEntity existing = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado"));

        existing.setName(request.name());
        existing.setDescription(request.description());
        existing.setPrice(request.price());
        existing.setOriginalPrice(request.originalPrice());
        existing.setStockQuantity(request.stockQuantity());
        existing.setWeight(request.weight());
        existing.setHeight(request.height());
        existing.setWidth(request.width());
        existing.setLength(request.length());
        existing.setNcm(request.ncm());
        existing.setProductionType(request.productionType());
        existing.setOrigin(request.origin());
        existing.setCategoryId(request.categoryId());

        if (request.media() != null) {
            existing.setImages(request.media().stream()
                    .map(ProductCreateRequest.ProductMediaItem::url)
                    .collect(Collectors.toCollection(ArrayList::new)));
        }

        if (request.marketplaceIds() != null) {
            existing.setMarketplaceIds(request.marketplaceIds());
        }

        List<com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity> variants = mapVariants(
                request.variants());

        return ResponseEntity.ok(productService.updateProduct(id, existing, variants, images));
    }

    private void validateRequest(ProductCreateRequest request) {
        if (request.categoryId() == null) {
            throw new BusinessException("A categoria é obrigatória.");
        }

        if (request.weight() == null || request.weight().compareTo(java.math.BigDecimal.ZERO) <= 0 ||
                request.height() == null || request.height().compareTo(java.math.BigDecimal.ZERO) <= 0 ||
                request.width() == null || request.width().compareTo(java.math.BigDecimal.ZERO) <= 0 ||
                request.length() == null || request.length().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BusinessException(
                    "Peso e dimensões (altura, largura, comprimento) são obrigatórios e devem ser maiores que zero.");
        }

        if (request.originalPrice() != null && request.price() != null
                && request.price().compareTo(request.originalPrice()) > 0) {
            throw new BusinessException("O preço de venda deve ser menor que o preço original.");
        }
    }

    private ProductEntity mapRequestToEntity(ProductCreateRequest request) {
        ProductEntity product = new ProductEntity();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setOriginalPrice(request.originalPrice());
        product.setStockQuantity(request.stockQuantity());
        product.setWeight(request.weight());
        product.setHeight(request.height());
        product.setWidth(request.width());
        product.setLength(request.length());
        product.setNcm(request.ncm());
        product.setProductionType(request.productionType());
        product.setOrigin(request.origin());

        if (request.media() != null) {
            product.setImages(request.media().stream()
                    .map(ProductCreateRequest.ProductMediaItem::url)
                    .collect(Collectors.toCollection(ArrayList::new)));
        }

        if (request.marketplaceIds() != null) {
            product.setMarketplaceIds(request.marketplaceIds());
        }

        return product;
    }

    private List<com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity> mapVariants(
            List<ProductCreateRequest.ProductVariantRequest> variantRequests) {
        if (variantRequests == null)
            return null;

        return variantRequests.stream().map(v -> {
            var variant = new com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity();
            variant.setId(v.id());
            variant.setSku(v.sku());
            variant.setPrice(v.price());
            variant.setOriginalPrice(v.originalPrice());
            variant.setStockQuantity(v.stock());
            variant.setImageUrl(v.imageUrl());
            if (v.media() != null) {
                variant.setImages(v.media().stream().map(ProductCreateRequest.ProductMediaItem::url).toList());
            }
            try {
                if (v.attributes() != null) {
                    variant.setAttributesJson(
                            new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(v.attributes()));
                }
            } catch (Exception e) {
            }
            variant.setActive(true);
            return variant;
        }).toList();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            var mediaAsset = mediaStorageService.upload(file, "product-image", true);
            Map<String, String> response = new HashMap<>();
            response.put("id", mediaAsset.getId().toString());
            response.put("url", "/api/media/public/" + mediaAsset.getId());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Falha no upload: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}/toggle-alert")
    public ResponseEntity<Void> toggleAlert(@PathVariable UUID id) {
        productService.toggleAlert(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/generate-description")
    public ResponseEntity<?> generateDescription(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String imageUrl = payload.get("imageUrl");

        if (title == null || title.isBlank() || imageUrl == null || imageUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Título e imagem são obrigatórios."));
        }

        try {
            Map<String, String> desc = productService.generateProductInfo(title, imageUrl);
            return ResponseEntity.ok(desc);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erro ao processar IA."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
