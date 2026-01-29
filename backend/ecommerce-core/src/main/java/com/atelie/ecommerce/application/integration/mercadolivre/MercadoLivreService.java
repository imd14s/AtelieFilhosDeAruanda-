package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MercadoLivreService implements MarketplaceIntegrationService {

    private final ProductIntegrationRepository integrationRepository;
    private final DynamicConfigService configService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MercadoLivreService(ProductIntegrationRepository integrationRepository,
                               DynamicConfigService configService,
                               RestTemplate restTemplate) {
        this.integrationRepository = integrationRepository;
        this.configService = configService;
        this.restTemplate = restTemplate;
    }

    // --- Lógica INBOUND (Trazer Pedidos) ---
    @Override
    @Transactional(readOnly = true)
    public CreateOrderRequest fetchAndConvertOrder(String resourceId) {
        if (!configService.containsKey("ML_SYNC_ENABLED") || !configService.requireBoolean("ML_SYNC_ENABLED")) {
             // Silently ignore or throw depending on trigger
             return null; 
        }

        String token = configService.requireString("ML_ACCESS_TOKEN");
        String url = "https://api.mercadolibre.com/orders/" + resourceId;

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

            // Busca produto local vinculado
            var integration = integrationRepository.findByExternalIdAndIntegrationType(mlItemId, "MERCADO_LIVRE")
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
        // 1. Guard Clause: Config via Dashboard
        if (!configService.containsKey("ML_SYNC_ENABLED") || !configService.requireBoolean("ML_SYNC_ENABLED")) {
            log.info("Sync Mercado Livre desativado no Dashboard. Ignorando produto: {}", product.getName());
            return;
        }

        String token = configService.requireString("ML_ACCESS_TOKEN");
        String url = "https://api.mercadolibre.com/items";

        // 2. Monta Payload Real do ML
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", product.getName());
        payload.put("category_id", "MLB3530"); // Exemplo: Categoria Genérica (Dashboard poderia mapear isso)
        payload.put("price", product.getPrice());
        payload.put("currency_id", "BRL");
        payload.put("available_quantity", product.getStockQuantity());
        payload.put("buying_mode", "buy_it_now");
        payload.put("condition", "new");
        payload.put("listing_type_id", "gold_special");
        
        // Imagens (Se tiver URL pública)
        if (product.getImageUrl() != null && product.getImageUrl().startsWith("http")) {
            payload.put("pictures", List.of(Map.of("source", product.getImageUrl())));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            
            // 3. POST Real
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String mlId = response.getBody().get("id").asText();
                String permalink = response.getBody().get("permalink").asText();
                
                log.info("Anúncio criado no ML com sucesso! ID: {}, Link: {}", mlId, permalink);

                // 4. Salva o vínculo no banco para futuras atualizações de estoque
                saveIntegrationLink(product, mlId);
            }

        } catch (Exception e) {
            log.error("Falha ao criar anúncio no ML. Verifique Token/Permissões.", e);
            // Não relança erro para não abortar a transação do produto local
        }
    }

    private void saveIntegrationLink(ProductEntity product, String externalId) {
        // Verifica se já existe para evitar duplicação
        if (integrationRepository.findByExternalIdAndIntegrationType(externalId, "MERCADO_LIVRE").isEmpty()) {
            ProductIntegrationEntity link = new ProductIntegrationEntity(
                product, "MERCADO_LIVRE", externalId, null
            );
            integrationRepository.save(link);
        }
    }
}
