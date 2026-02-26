package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.application.dto.catalog.product.CreateVariantRequest;
import com.atelie.ecommerce.application.common.exception.ConflictException;
import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Service
public class ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final GtinGeneratorService gtinGenerator;

    public ProductVariantService(ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            GtinGeneratorService gtinGenerator) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.gtinGenerator = gtinGenerator;
    }

    @Transactional
    public ProductVariantEntity create(UUID productId, CreateVariantRequest request) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Produto pai não encontrado"));

        // Gera SKU automático se não vier
        String sku = (request.sku() == null || request.sku().isBlank())
                ? "SKU-" + product.getId().toString().substring(0, 8).toUpperCase() + "-"
                        + UUID.randomUUID().toString().substring(0, 4)
                : request.sku();

        if (variantRepository.existsBySku(sku)) {
            // Se foi gerado automático e colidiu, tenta mais uma vez ou falha (improvável
            // com UUID part)
            // Se foi fornecido, é erro de conflito real.
            if (request.sku() != null && !request.sku().isBlank()) {
                throw new ConflictException("SKU já existe: " + sku);
            }
            // Regenerate once more to be safe? Or just proceed (low collision prob)
            sku = "SKU-" + product.getId().toString().substring(0, 8).toUpperCase() + "-"
                    + UUID.randomUUID().toString().substring(0, 4);
        }

        // Gera GTIN automático se não vier no request
        String gtin = (request.gtin() == null || request.gtin().isBlank())
                ? gtinGenerator.generateInternalEan13()
                : request.gtin();

        // Stock default 0
        Integer stock = request.initialStock() != null ? request.initialStock() : 0;

        // Price default to product price
        BigDecimal price = (request.price() != null && request.price().compareTo(BigDecimal.ZERO) > 0)
                ? request.price()
                : product.getPrice();

        ProductVariantEntity variant = new ProductVariantEntity(
                product,
                sku,
                gtin,
                price,
                stock,
                request.attributesJson(),
                true);

        return variantRepository.save(variant);
    }

    public List<ProductVariantEntity> listByProduct(UUID productId) {
        return variantRepository.findByProductId(productId);
    }
}
