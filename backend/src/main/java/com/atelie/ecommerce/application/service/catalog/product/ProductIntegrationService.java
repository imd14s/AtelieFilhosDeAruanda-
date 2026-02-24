package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.LinkIntegrationRequest;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.integration.repository.MarketplaceIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class ProductIntegrationService {

        private final ProductRepository productRepository;
        private final ProductIntegrationRepository integrationRepository;
        private final MarketplaceIntegrationRepository marketplaceIntegrationRepository;

        public ProductIntegrationService(ProductRepository productRepository,
                        ProductIntegrationRepository integrationRepository,
                        MarketplaceIntegrationRepository marketplaceIntegrationRepository) {
                this.productRepository = productRepository;
                this.integrationRepository = integrationRepository;
                this.marketplaceIntegrationRepository = marketplaceIntegrationRepository;
        }

        @Transactional
        public void linkProduct(UUID productId, LinkIntegrationRequest request) {
                ProductEntity product = productRepository.findById(productId)
                                .orElseThrow(() -> new NotFoundException("Product not found"));

                MarketplaceIntegrationEntity integration = marketplaceIntegrationRepository
                                .findById(request.integrationId())
                                .orElseThrow(
                                                () -> new NotFoundException("Integration not found for ID "
                                                                + request.integrationId()));

                if (integrationRepository
                                .findByExternalProductIdAndIntegration_Id(request.externalId(), integration.getId())
                                .isPresent()) {
                        throw new ConflictException(
                                        "External ID " + request.externalId() + " already linked for account "
                                                        + integration.getAccountName());
                }

                ProductIntegrationEntity link = new ProductIntegrationEntity(
                                product,
                                integration,
                                request.externalId(),
                                request.skuExternal());
                integrationRepository.save(link);
        }
}
