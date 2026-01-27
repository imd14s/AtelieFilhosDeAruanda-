package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.LinkIntegrationRequest;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductIntegrationEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProductIntegrationService {

    private final ProductRepository productRepository;
    private final ProductIntegrationRepository integrationRepository;

    public ProductIntegrationService(ProductRepository productRepository, ProductIntegrationRepository integrationRepository) {
        this.productRepository = productRepository;
        this.integrationRepository = integrationRepository;
    }

    @Transactional
    public void linkProduct(UUID productId, LinkIntegrationRequest request) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        // Verifica duplicidade (Já existe este ID externo para este tipo?)
        if (integrationRepository.findByExternalIdAndIntegrationType(request.externalId(), request.integrationType()).isPresent()) {
            throw new ConflictException("External ID " + request.externalId() + " is already linked to a product.");
        }

        ProductIntegrationEntity link = new ProductIntegrationEntity(
                product,
                request.integrationType(),
                request.externalId(),
                request.skuExternal()
        );

        integrationRepository.save(link);
    }
}
