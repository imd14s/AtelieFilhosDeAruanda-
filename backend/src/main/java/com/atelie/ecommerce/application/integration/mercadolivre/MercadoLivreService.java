package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MercadoLivreService implements MarketplaceIntegrationService {

    private final ProductIntegrationRepository integrationRepository;
    private final DynamicConfigService configService;
    private final RestTemplate restTemplate;
    private final Environment env;

    public MercadoLivreService(ProductIntegrationRepository integrationRepository,
                               DynamicConfigService configService,
                               RestTemplate restTemplate,
                               Environment env) {
        this.integrationRepository = integrationRepository;
        this.configService = configService;
        this.restTemplate = restTemplate;
        this.env = env;
    }

    private String mlBaseUrl() {
        // ENV: ML_API_BASE_URL (default oficial)
        return env.getProperty("ML_API_BASE_URL", "https://api.mercadolibre.com").trim();
    }

    private String mlDefaultCategory() {
        // ENV: ML_CATEGORY_DEFAULT (default existente do código antigo)
        return env.getProperty("ML_CATEGORY_DEFAULT", "MLB3530").trim();
    }

    // --- Lógica INBOUND (Trazer Pedidos) ---
    @Override
    @Transactional(readOnly = true)
    public CreateOrderRequest fetchAndConvertOrder(String resourceId) {
        if (!configService.containsKey("ML_SYNC_ENABLED") || !configService.requireBoolean("ML_SYNC_ENABLED")) {
            return null;
        }

        String token = configService.requireString("ML_ACCESS_TOKEN");
        String url = mlBaseUrl() + "/orders/" + resourceId;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
            JsonNode orderJson = response.getBody();

            if (orderJson == null) throw new RuntimeException("Empty response from ML");

            JsonNode orderItems = orderJson.path("order_items");
            if (orderItems.isEmpty()) throw new IllegalStateException("ML Order without items: " + resourceId);

            JsonNode firstItem = orderItems.get(0);
            String mlItemId = firstItem.path("item").path("id").asText();
            int quantity = firstItem.path("quantity").asInt(1);

            var integration = integrationRepository
                .findByExternalIdAndIntegrationType(mlItemId, "MERCADO_LIVRE")
                .orElseThrow(() -> new IllegalArgumentException("Produto não vinculado para item ML: " + mlItemId));

            String customerName = orderJson.path("buyer").path("nickname").asText("Desconhecido");

            return new CreateOrderRequest(
                "MERCADO_LIVRE",
                resourceId,
                customerName,
                List.of(new CreateOrderItemRequest(integration.getProduct().getId(), null, quantity))
            );

        } catch (Exception e) {
            log.error("Erro integration fetch ML", e);
            throw new RuntimeException("Erro ML Fetch", e);
        }
    }

    // --- Lógica OUTBOUND (Publicar/Atualizar Anúncio Real) ---
    public void createListing(ProductEntity product) {
        if (!configService.containsKey("ML_SYNC_ENABLED") || !configService.requireBoolean("ML_SYNC_ENABLED")) {
            log.info("Sync Mercado Livre desativado no Dashboard. Ignorando produto: {}", product.getName());
            return;
        }

        String token = configService.requireString("ML_ACCESS_TOKEN");
        String url = mlBaseUrl() + "/items";

        Map<String, Object> payload = new HashMap<>();
        payload.put("title", product.getName());
        payload.put("category_id", mlDefaultCategory());
        payload.put("price", product.getPrice());
        payload.put("currency_id", "BRL");
        payload.put("available_quantity", product.getStockQuantity());
        payload.put("buying_mode", "buy_it_now");
        payload.put("condition", "new");
        payload.put("listing_type_id", "gold_special");

        if (product.getImageUrl() != null && product.getImageUrl().startsWith("http")) {
            payload.put("pictures", List.of(Map.of("source", product.getImageUrl())));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String mlId = response.getBody().get("id").asText();
                String permalink = response.getBody().get("permalink").asText();

                log.info("Anúncio criado no ML com sucesso! ID: {}, Link: {}", mlId, permalink);

                saveIntegrationLink(product, mlId);
            }

        } catch (Exception e) {
            log.error("Falha ao criar anúncio no ML. Verifique Token/Permissões.", e);
        }
    }

    private void saveIntegrationLink(ProductEntity product, String externalId) {
        if (integrationRepository.findByExternalIdAndIntegrationType(externalId, "MERCADO_LIVRE").isEmpty()) {
            ProductIntegrationEntity link = new ProductIntegrationEntity(
                product, "MERCADO_LIVRE", externalId, null
            );
            integrationRepository.save(link);
        }
    }
}
