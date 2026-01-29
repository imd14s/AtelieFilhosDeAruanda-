package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.LinkIntegrationRequest;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationEntity;
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

        if (integrationRepository.findByExternalIdAndIntegrationType(request.externalId(), request.integrationType()).isPresent()) {
            throw new ConflictException("External ID " + request.externalId() + " already linked for type " + request.integrationType());
        }

        ProductIntegrationEntity link = new ProductIntegrationEntity(
                product,
                request.integrationType().toUpperCase(), // Padroniza
                request.externalId(),
                request.skuExternal()
        );
        integrationRepository.save(link);
    }
}
