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

@Service
public class MarketplaceCoreService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MarketplaceCoreService.class);

    private final MarketplaceIntegrationFactory factory;
    private final MarketplaceIntegrationRepository repository;
    private final EncryptionUtility encryptionUtility;
    private final ObjectMapper objectMapper;

    public MarketplaceCoreService(MarketplaceIntegrationFactory factory,
            MarketplaceIntegrationRepository repository,
            EncryptionUtility encryptionUtility,
            ObjectMapper objectMapper) {
        this.factory = factory;
        this.repository = repository;
        this.encryptionUtility = encryptionUtility;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public MarketplaceIntegrationEntity saveCredentials(String provider, Map<String, String> credentials) {
        try {
            MarketplaceIntegrationEntity integration = repository.findByProvider(provider)
                    .orElse(new MarketplaceIntegrationEntity(provider, false));

            String jsonCredentials = objectMapper.writeValueAsString(credentials);
            integration.setEncryptedCredentials(encryptionUtility.encrypt(jsonCredentials));

            return repository.save(integration);
        } catch (Exception e) {
            log.error("Error saving credentials for {}", provider, e);
            throw new RuntimeException("Failed to save credentials", e);
        }
    }

    public void testConnection(String provider, Map<String, String> credentials) {
        IMarketplaceAdapter adapter = factory.getAdapter(provider)
                .orElseThrow(() -> new com.atelie.ecommerce.api.common.exception.NotFoundException(
                        "Adapter not found for " + provider));
        adapter.testConnection(credentials);
    }

    public String getAuthorizationUrl(String provider, String redirectUri) {
        MarketplaceIntegrationEntity integration = repository.findByProvider(provider)
                .orElseThrow(() -> new com.atelie.ecommerce.api.common.exception.NotFoundException(
                        "Integration not configured for " + provider));

        IMarketplaceAdapter adapter = factory.getAdapter(provider)
                .orElseThrow(() -> new com.atelie.ecommerce.api.common.exception.NotFoundException(
                        "Adapter not found for " + provider));

        Map<String, String> credentials = getDecryptedCredentials(integration);
        return adapter.getAuthUrl(credentials, redirectUri);
    }

    @Transactional
    public void handleCallback(String provider, String code, String redirectUri) {
        MarketplaceIntegrationEntity integration = repository.findByProvider(provider)
                .orElseThrow(() -> new RuntimeException("Integration not configured for " + provider));

        IMarketplaceAdapter adapter = factory.getAdapter(provider)
                .orElseThrow(() -> new RuntimeException("Adapter not found for " + provider));

        Map<String, String> credentials = getDecryptedCredentials(integration);
        Map<String, Object> authPayload = adapter.handleAuthCallback(code, credentials, redirectUri);

        try {
            integration.setAuthPayload(objectMapper.writeValueAsString(authPayload));
            integration.setActive(true);
            repository.save(integration);
        } catch (Exception e) {
            log.error("Error saving auth payload for {}", provider, e);
            throw new RuntimeException("Failed to save auth payload", e);
        }
    }

    /**
     * Middleware de Renovação Automática (CRÍTICO)
     * Se (agora >= data_expiracao - 10min) ENTÃO execute refreshToken() e atualize
     * o banco.
     */
    public void ensureValidToken(String provider) {
        MarketplaceIntegrationEntity integration = repository.findByProvider(provider)
                .orElseThrow(() -> new RuntimeException("Integration not configured for " + provider));

        if (!integration.isActive() || integration.getAuthPayload() == null) {
            return;
        }

        try {
            Map<String, Object> payload = objectMapper.readValue(integration.getAuthPayload(), Map.class);
            Object expiresAtObj = payload.get("expiresAt");

            if (expiresAtObj instanceof Long expiresAt) {
                if (System.currentTimeMillis() >= (expiresAt - 600000)) { // 10 minutes buffer
                    log.info("Token expiring soon for {}. Refreshing...", provider);
                    IMarketplaceAdapter adapter = factory.getAdapter(provider)
                            .orElseThrow(() -> new RuntimeException("Adapter not found"));

                    Map<String, String> credentials = getDecryptedCredentials(integration);
                    Map<String, Object> newPayload = adapter.refreshToken(integration, credentials);
                    if (!newPayload.isEmpty()) {
                        integration.setAuthPayload(objectMapper.writeValueAsString(newPayload));
                        repository.save(integration);
                        log.info("Token refreshed successfully for {}", provider);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error during token refresh check for {}", provider, e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> getDecryptedCredentials(MarketplaceIntegrationEntity integration) {
        try {
            String decrypted = encryptionUtility.decrypt(integration.getEncryptedCredentials());
            return objectMapper.readValue(decrypted, Map.class);
        } catch (Exception e) {
            log.error("Error decrypting credentials for {}", integration.getProvider(), e);
            throw new RuntimeException("Failed to decrypt credentials", e);
        }
    }

    public Optional<MarketplaceIntegrationEntity> getIntegration(String provider) {
        return repository.findByProvider(provider);
    }

    public void handleWebhook(String provider, Map<String, Object> payload) {
        IMarketplaceAdapter adapter = factory.getAdapter(provider)
                .orElseThrow(() -> new RuntimeException("Adapter not found for " + provider)); // Added orElseThrow for
                                                                                               // adapter
        List<MarketplaceIntegrationEntity> integrations = repository.findByProviderAndActiveTrue(provider);

        // Para webhooks, geralmente precisamos identificar qual conta disparou o
        // evento.
        // Se o payload contém o seller_id ou similar, filtramos por ele.
        // Por simplicidade, passamos para todas as integrações ativas do provedor
        // ou a lógica interna do adapter filtra.
        for (MarketplaceIntegrationEntity integration : integrations) {
            adapter.handleWebhook(integration, payload);
        }
    }

    /**
     * Exporta um produto para um marketplace específico.
     * Valida o token antes de exportar e retorna o resultado da operação.
     */
    public void exportProduct(String provider,
            com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity product) {
        ensureValidToken(provider);

        MarketplaceIntegrationEntity integration = repository.findByProvider(provider)
                .orElseThrow(() -> new RuntimeException("Integration not configured for " + provider));

        if (!integration.isActive()) {
            throw new RuntimeException("Integration is not active for " + provider);
        }

        IMarketplaceAdapter adapter = factory.getAdapter(provider)
                .orElseThrow(() -> new RuntimeException("Adapter not found for " + provider));

        adapter.exportProduct(product, integration);
    }
}
