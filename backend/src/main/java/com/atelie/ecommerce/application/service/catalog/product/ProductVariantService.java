package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateVariantRequest;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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

        if (variantRepository.existsBySku(request.sku())) {
            throw new ConflictException("SKU já existe: " + request.sku());
        }

        // Gera GTIN automático se não vier no request
        String gtin = (request.gtin() == null || request.gtin().isBlank())
                ? gtinGenerator.generateInternalEan13()
                : request.gtin();

        ProductVariantEntity variant = new ProductVariantEntity(
                product,
                request.sku(),
                gtin,
                request.price(),
                request.initialStock(),
                request.attributesJson(),
                true);

        return variantRepository.save(variant);
    }

    public List<ProductVariantEntity> listByProduct(UUID productId) {
        return variantRepository.findByProductId(productId);
    }
}
