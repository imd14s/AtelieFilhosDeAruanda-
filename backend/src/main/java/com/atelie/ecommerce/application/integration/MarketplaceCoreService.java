package com.atelie.ecommerce.application.integration;

import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.integration.repository.MarketplaceIntegrationRepository;
import com.atelie.ecommerce.infrastructure.security.EncryptionUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.HashSet;
import java.util.Set;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import com.atelie.ecommerce.api.common.exception.NotFoundException;

@Service
public class MarketplaceCoreService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MarketplaceCoreService.class);

    private final MarketplaceIntegrationFactory factory;
    private final MarketplaceIntegrationRepository repository;
    private final EncryptionUtility encryptionUtility;
    private final ObjectMapper objectMapper;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceProviderJpaRepository providerRepository;

    public MarketplaceCoreService(MarketplaceIntegrationFactory factory,
            MarketplaceIntegrationRepository repository,
            EncryptionUtility encryptionUtility,
            ObjectMapper objectMapper,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ServiceProviderJpaRepository providerRepository) {
        this.factory = factory;
        this.repository = repository;
        this.encryptionUtility = encryptionUtility;
        this.objectMapper = objectMapper;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.providerRepository = providerRepository;
    }

    @Transactional
    public MarketplaceIntegrationEntity createIntegration(String provider, String accountName) {
        MarketplaceIntegrationEntity integration = new MarketplaceIntegrationEntity(provider, false);
        integration.setAccountName(accountName);
        return repository.save(integration);
    }

    public List<MarketplaceIntegrationEntity> getAllIntegrations() {
        return repository.findAll();
    }

    public Optional<MarketplaceIntegrationEntity> getIntegrationById(UUID id) {
        return repository.findById(id);
    }

    public Optional<MarketplaceIntegrationEntity> getIntegrationByProvider(String provider) {
        return repository.findAllByProvider(provider).stream().findFirst();
    }

    @Transactional
    public MarketplaceIntegrationEntity saveCredentials(UUID integrationId, Map<String, String> credentials) {
        try {
            MarketplaceIntegrationEntity integration = repository.findById(integrationId)
                    .orElseThrow(() -> new NotFoundException("Integration not found: " + integrationId));

            String jsonCredentials = objectMapper.writeValueAsString(credentials);
            integration.setEncryptedCredentials(encryptionUtility.encrypt(jsonCredentials));

            return repository.save(integration);
        } catch (Exception e) {
            log.error("Error saving credentials for ID {}", integrationId, e);
            throw new RuntimeException("Failed to save credentials", e);
        }
    }

    @Transactional
    public MarketplaceIntegrationEntity saveCredentialsByProvider(String provider, Map<String, String> credentials) {
        try {
            MarketplaceIntegrationEntity integration = getIntegrationByProvider(provider)
                    .orElseGet(() -> createIntegration(provider, provider));

            String jsonCredentials = objectMapper.writeValueAsString(credentials);
            integration.setEncryptedCredentials(encryptionUtility.encrypt(jsonCredentials));

            return repository.save(integration);
        } catch (Exception e) {
            log.error("Error saving credentials for provider {}", provider, e);
            throw new RuntimeException("Failed to save credentials", e);
        }
    }

    public void testConnection(String provider, Map<String, String> credentials) {
        IMarketplaceAdapter adapter = factory.getAdapter(provider)
                .orElseThrow(() -> new NotFoundException("Adapter not found for " + provider));
        adapter.testConnection(credentials);
    }

    public String getAuthorizationUrl(UUID integrationId, String redirectUri) {
        MarketplaceIntegrationEntity integration = repository.findById(integrationId)
                .orElseThrow(() -> new NotFoundException("Integration not found for ID " + integrationId));

        return buildAuthorizationUrl(integration, redirectUri);
    }

    public String getAuthorizationUrlByProvider(String provider, String redirectUri) {
        MarketplaceIntegrationEntity integration = getIntegrationByProvider(provider)
                .orElseThrow(() -> new NotFoundException("Integration not found for " + provider));

        return buildAuthorizationUrl(integration, redirectUri);
    }

    private String buildAuthorizationUrl(MarketplaceIntegrationEntity integration, String redirectUri) {
        IMarketplaceAdapter adapter = factory.getAdapter(integration.getProvider())
                .orElseThrow(() -> new NotFoundException("Adapter not found for " + integration.getProvider()));

        Map<String, String> credentials = integration.getEncryptedCredentials() != null
                ? getDecryptedCredentials(integration)
                : Map.of();

        return adapter.getAuthUrl(credentials, redirectUri, integration.getId().toString());
    }

    @Transactional
    public void handleCallback(String provider, String code, String redirectUri, String state) {
        if (state == null || state.isBlank() || state.equals("auth")) {
            throw new RuntimeException("Invalid state representing Integration ID from Callback");
        }

        UUID integrationId = UUID.fromString(state);

        MarketplaceIntegrationEntity integration = repository.findById(integrationId)
                .orElseThrow(() -> new RuntimeException("Integration not found for ID " + integrationId));

        IMarketplaceAdapter adapter = factory.getAdapter(integration.getProvider())
                .orElseThrow(() -> new RuntimeException("Adapter not found for " + integration.getProvider()));

        Map<String, String> credentials = integration.getEncryptedCredentials() != null
                ? getDecryptedCredentials(integration)
                : Map.of();
        Map<String, Object> authPayload = adapter.handleAuthCallback(code, credentials, redirectUri);

        try {
            integration.setAuthPayload(objectMapper.writeValueAsString(authPayload));
            integration.setActive(true);

            // Tenta resgatar identificador do Seller ID vindo do payload (ex: "user_id" do
            // ML)
            if (authPayload.containsKey("user_id")) {
                integration.setExternalSellerId(String.valueOf(authPayload.get("user_id")));
            }
            if (authPayload.containsKey("seller_id")) {
                integration.setExternalSellerId(String.valueOf(authPayload.get("seller_id")));
            }

            repository.save(integration);
        } catch (Exception e) {
            log.error("Error saving auth payload for ID {}", integrationId, e);
            throw new RuntimeException("Failed to save auth payload", e);
        }
    }

    public void ensureValidToken(UUID integrationId) {
        MarketplaceIntegrationEntity integration = repository.findById(integrationId)
                .orElseThrow(() -> new RuntimeException("Integration not found for ID " + integrationId));

        if (!integration.isActive() || integration.getAuthPayload() == null) {
            return;
        }

        try {
            Map<String, Object> payload = objectMapper.readValue(integration.getAuthPayload(), Map.class);
            Object expiresAtObj = payload.get("expiresAt");

            if (expiresAtObj instanceof Long expiresAt) {
                if (System.currentTimeMillis() >= (expiresAt - 600000)) { // 10 minutes buffer
                    log.info("Token expiring soon for ID {}. Refreshing...", integrationId);
                    IMarketplaceAdapter adapter = factory.getAdapter(integration.getProvider())
                            .orElseThrow(() -> new RuntimeException("Adapter not found"));

                    Map<String, String> credentials = getDecryptedCredentials(integration);
                    Map<String, Object> newPayload = adapter.refreshToken(integration, credentials);
                    if (!newPayload.isEmpty()) {
                        integration.setAuthPayload(objectMapper.writeValueAsString(newPayload));
                        repository.save(integration);
                        log.info("Token refreshed successfully for ID {}", integrationId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error during token refresh check for ID {}", integrationId, e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> getDecryptedCredentials(MarketplaceIntegrationEntity integration) {
        try {
            String decrypted = encryptionUtility.decrypt(integration.getEncryptedCredentials());
            return objectMapper.readValue(decrypted, Map.class);
        } catch (Exception e) {
            log.error("Error decrypting credentials for ID {}", integration.getId(), e);
            throw new RuntimeException("Failed to decrypt credentials", e);
        }
    }

    public void handleWebhook(String provider, Map<String, Object> payload) {
        IMarketplaceAdapter adapter = factory.getAdapter(provider)
                .orElseThrow(() -> new RuntimeException("Adapter not found for " + provider));

        List<MarketplaceIntegrationEntity> integrations = repository.findByProviderAndActiveTrue(provider);

        // Se tiver seller_id no json (ML envia user_id)
        String incomingSellerId = null;
        if (payload.containsKey("user_id"))
            incomingSellerId = String.valueOf(payload.get("user_id"));
        if (payload.containsKey("seller_id"))
            incomingSellerId = String.valueOf(payload.get("seller_id"));

        if (incomingSellerId != null) {
            MarketplaceIntegrationEntity specificIntegration = repository
                    .findByProviderAndExternalSellerId(provider, incomingSellerId).orElse(null);
            if (specificIntegration != null && specificIntegration.isActive()) {
                adapter.handleWebhook(specificIntegration, payload);
                return;
            }
        }

        for (MarketplaceIntegrationEntity integration : integrations) {
            adapter.handleWebhook(integration, payload);
        }
    }

    @Transactional
    public int syncProducts(UUID integrationId) {
        log.info("Starting product sync for Integration ID: {}", integrationId);

        MarketplaceIntegrationEntity integration = repository.findById(integrationId)
                .orElseThrow(() -> new RuntimeException("Integration not configured for ID " + integrationId));

        if (!integration.isActive()) {
            throw new RuntimeException("Integration is not active for ID " + integrationId);
        }

        IMarketplaceAdapter adapter = factory.getAdapter(integration.getProvider())
                .orElseThrow(() -> new RuntimeException("Adapter not found for " + integration.getProvider()));

        List<ProductEntity> remoteProducts = adapter.fetchProducts(integration);

        ServiceProviderEntity ecommerceProvider = providerRepository.findByCode("LOJA_VIRTUAL")
                .orElseThrow(() -> new RuntimeException(
                        "Provedor Ecommerce não encontrado no sistema. Verifique o seed data."));

        CategoryEntity defaultCategory = categoryRepository.findAll().stream()
                .filter(CategoryEntity::getActive)
                .findFirst()
                .orElseThrow(
                        () -> new RuntimeException("Nenhuma categoria ativa encontrada para vincular os produtos."));

        int count = 0;
        for (ProductEntity remote : remoteProducts) {
            if (productRepository.findByNameContainingIgnoreCase(remote.getName(),
                    org.springframework.data.domain.Pageable.unpaged()).isEmpty()) {
                remote.setCategory(defaultCategory);
                remote.setActive(true);

                Set<ServiceProviderEntity> platforms = new HashSet<>();
                platforms.add(ecommerceProvider);
                remote.setMarketplaces(platforms);

                ProductEntity saved = productRepository.save(remote);
                log.info("Synced and saved product: {} (ID: {})", saved.getName(), saved.getId());
                count++;
            } else {
                log.info("Product already sync'd or exists: {}", remote.getName());
            }
        }

        return count;
    }

    @Transactional
    public int syncProductsByProvider(String provider) {
        MarketplaceIntegrationEntity integration = getIntegrationByProvider(provider)
                .orElseThrow(() -> new RuntimeException("Integration not configured for " + provider));
        return syncProducts(integration.getId());
    }

    public void exportProduct(UUID integrationId,
            com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity product) {
        ensureValidToken(integrationId);

        MarketplaceIntegrationEntity integration = repository.findById(integrationId)
                .orElseThrow(() -> new RuntimeException("Integration not configured for ID " + integrationId));

        if (!integration.isActive()) {
            throw new RuntimeException("Integration is not active for ID " + integrationId);
        }

        IMarketplaceAdapter adapter = factory.getAdapter(integration.getProvider())
                .orElseThrow(() -> new RuntimeException("Adapter not found for " + integration.getProvider()));

        adapter.exportProduct(product, integration);
    }
}
