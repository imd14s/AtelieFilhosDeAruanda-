package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.application.integration.IMarketplaceAdapter;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class MercadoLivreAdapter implements IMarketplaceAdapter {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MercadoLivreAdapter.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final Environment env;
    private final ProductIntegrationRepository integrationRepository;
    private final OrderService orderService;

    public MercadoLivreAdapter(RestTemplate restTemplate, ObjectMapper objectMapper, Environment env,
            ProductIntegrationRepository integrationRepository, OrderService orderService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.env = env;
        this.integrationRepository = integrationRepository;
        this.orderService = orderService;
    }

    private String mlBaseUrl() {
        return env.getProperty("ML_API_BASE_URL", "https://api.mercadolibre.com").trim();
    }

    private String mlDefaultCategory() {
        return env.getProperty("ML_CATEGORY_DEFAULT", "MLB3530").trim();
    }

    @Override
    public String getProviderCode() {
        return "mercadolivre";
    }

    @Override
    public String getAuthUrl(Map<String, String> credentials, String redirectUri) {
        String clientId = credentials.get("appId");
        return String.format(
                "https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=%s&redirect_uri=%s",
                clientId, redirectUri);
    }

    @Override
    public Map<String, Object> handleAuthCallback(String code, Map<String, String> credentials, String redirectUri) {
        String url = "https://api.mercadolibre.com/oauth/token";
        String clientId = credentials.get("appId");
        String clientSecret = credentials.get("clientSecret");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "authorization_code");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("code", code);
        map.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);

        return processTokenResponse(response);
    }

    @Override
    public Map<String, Object> refreshToken(MarketplaceIntegrationEntity integration, Map<String, String> credentials) {
        if (integration.getAuthPayload() == null) {
            return Collections.emptyMap();
        }

        try {
            JsonNode payloadJson = objectMapper.readTree(integration.getAuthPayload());
            String refreshToken = payloadJson.path("refreshToken").asText();
            String clientId = credentials.get("appId");
            String clientSecret = credentials.get("clientSecret");

            if (refreshToken.isEmpty() || clientId == null || clientSecret == null) {
                return Collections.emptyMap();
            }

            String url = "https://api.mercadolibre.com/oauth/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("grant_type", "refresh_token");
            map.add("client_id", clientId);
            map.add("client_secret", clientSecret);
            map.add("refresh_token", refreshToken);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);

            return processTokenResponse(response);
        } catch (Exception e) {
            log.error("Erro ao renovar token no Mercado Livre", e);
            return Collections.emptyMap();
        }
    }

    private Map<String, Object> processTokenResponse(ResponseEntity<JsonNode> response) {
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode body = response.getBody();
            Map<String, Object> result = new HashMap<>();
            result.put("accessToken", body.get("access_token").asText());
            result.put("refreshToken", body.get("refresh_token").asText());
            result.put("expiresIn", body.get("expires_in").asInt());
            if (body.has("user_id"))
                result.put("sellerId", body.get("user_id").asText());
            result.put("expiresAt", System.currentTimeMillis() + (body.get("expires_in").asLong() * 1000));
            return result;
        }
        throw new RuntimeException("Failed to exchange code for token with Mercado Livre");
    }

    @Override
    public void exportProduct(ProductEntity product, MarketplaceIntegrationEntity integration) {
        if (integration.getAuthPayload() == null) {
            log.warn("Cannot export product to ML: No auth payload for integration {}", integration.getId());
            return;
        }

        try {
            JsonNode payloadJson = objectMapper.readTree(integration.getAuthPayload());
            String token = payloadJson.path("accessToken").asText();

            if (token.isEmpty()) {
                log.warn("Cannot export product to ML: Access token is empty for integration {}", integration.getId());
                return;
            }

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

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String mlId = response.getBody().get("id").asText();
                String permalink = response.getBody().get("permalink").asText();
                log.info("Produto exportado para ML com sucesso! ID: {}, Link: {}", mlId, permalink);
                saveIntegrationLink(product, mlId);
            }
        } catch (Exception e) {
            log.error("Erro ao exportar produto para Mercado Livre", e);
        }
    }

    private void saveIntegrationLink(ProductEntity product, String externalId) {
        if (integrationRepository.findByExternalIdAndIntegrationType(externalId, "mercadolivre").isEmpty()) {
            ProductIntegrationEntity link = new ProductIntegrationEntity(product, "mercadolivre", externalId, null);
            integrationRepository.save(link);
        }
    }

    @Override
    public void handleWebhook(MarketplaceIntegrationEntity integration, Map<String, Object> payload) {
        log.info("Recebido webhook do Mercado Livre para integração {}: {}", integration.getId(), payload);

        try {
            String topic = (String) payload.get("topic");
            String resource = (String) payload.get("resource");

            if ("orders_v2".equals(topic) && resource != null) {
                // Remove leading slash if present
                String orderIdStr = resource.startsWith("/") ? resource.substring(1) : resource;
                fetchAndProcessOrder(integration, orderIdStr);
            }
        } catch (Exception e) {
            log.error("Erro ao processar webhook do Mercado Livre", e);
        }
    }

    private void fetchAndProcessOrder(MarketplaceIntegrationEntity integration, String resourcePath) {
        if (integration.getAuthPayload() == null) {
            log.warn("Cannot fetch ML order: No auth payload for integration {}", integration.getId());
            return;
        }

        try {
            JsonNode payloadJson = objectMapper.readTree(integration.getAuthPayload());
            String token = payloadJson.path("accessToken").asText();

            if (token.isEmpty()) {
                log.warn("Cannot fetch ML order: Access token is empty");
                return;
            }

            String url = mlBaseUrl() + "/" + resourcePath;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode orderNode = response.getBody();

                String externalOrderId = orderNode.path("id").asText();
                String status = mapMlStatusToInternal(orderNode.path("status").asText());
                String customerName = orderNode.path("buyer").path("nickname").asText();
                if (orderNode.path("buyer").has("first_name")) {
                    customerName = orderNode.path("buyer").path("first_name").asText() + " "
                            + orderNode.path("buyer").path("last_name").asText();
                }

                java.math.BigDecimal totalAmount = new java.math.BigDecimal(orderNode.path("total_amount").asText());

                List<CreateOrderItemRequest> items = new ArrayList<>();
                if (orderNode.has("order_items")) {
                    for (JsonNode itemNode : orderNode.path("order_items")) {
                        String mlItemId = itemNode.path("item").path("id").asText(); // e.g. MLB123456
                        int quantity = itemNode.path("quantity").asInt();

                        // Find local product based on ML ID
                        integrationRepository.findByExternalIdAndIntegrationType(mlItemId, "mercadolivre")
                                .ifPresentOrElse(link -> {
                                    // Found corresponding local product
                                    items.add(new CreateOrderItemRequest(link.getProduct().getId(), null, quantity));
                                }, () -> {
                                    log.warn("Product {} not found locally for ML Order {}", mlItemId, externalOrderId);
                                    // Depending on requirements, we could create a stub product or just skip stock
                                    // deduction.
                                    // The OrderService handles null products safely for external orders by creating
                                    // an empty local item logging it.
                                    // We need a fake UUID to pass to the request record just to let it through
                                    // though.
                                    // For simplicity and safety, if we don't know the product, we skip creating the
                                    // specific line in local DB
                                    // or we can just pass a null UUID if the record allows it.
                                    // Since CreateOrderItemRequest requires UUID, we skip it.
                                });
                    }
                }

                // If no items matched locally, we can still save the order header for financial
                // tracking,
                // but stock won't be deducted.

                orderService.processMarketplaceOrder(
                        "mercadolivre",
                        externalOrderId,
                        customerName,
                        null, // Email could be fetched if available in orderNode.path("buyer").path("email")
                        status,
                        totalAmount,
                        items);

                log.info("Processado com sucesso pedido MercadoLivre: {}", externalOrderId);
            }
        } catch (Exception e) {
            log.error("Erro ao buscar detalhes do pedido no Mercado Livre: " + resourcePath, e);
        }
    }

    private String mapMlStatusToInternal(String mlStatus) {
        return switch (mlStatus) {
            case "paid" -> com.atelie.ecommerce.domain.order.OrderStatus.PAID.name();
            case "cancelled" -> com.atelie.ecommerce.domain.order.OrderStatus.CANCELED.name();
            case "shipped" -> com.atelie.ecommerce.domain.order.OrderStatus.SHIPPED.name();
            case "delivered" -> com.atelie.ecommerce.domain.order.OrderStatus.DELIVERED.name();
            default -> com.atelie.ecommerce.domain.order.OrderStatus.PENDING.name();
        };
    }

    @Override
    public List<ProductEntity> fetchProducts(MarketplaceIntegrationEntity integration) {
        log.info("Fetching products from Mercado Livre for integration {}", integration.getId());
        // Implementação real exigiria paginação na API /users/{user_id}/items/search
        // e depois detalhamento de cada item. Por enquanto, retornamos lista vazia ou
        // simulada para manter a consistência da interface.
        return Collections.emptyList();
    }

    @Override
    public void testConnection(Map<String, String> credentials) {
        String appId = credentials.get("appId");
        String clientSecret = credentials.get("clientSecret");

        if (appId == null || appId.isBlank()) {
            throw new IllegalArgumentException("App ID é obrigatório");
        }
        if (clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalArgumentException("Client Secret é obrigatório");
        }

        try {
            // Verifica conectividade básica com a API pública
            ResponseEntity<String> response = restTemplate.getForEntity(mlBaseUrl() + "/sites/MLB", String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Falha ao conectar com a API do Mercado Livre: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao conectar com a API do Mercado Livre: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Map<String, Object>> getOrders(MarketplaceIntegrationEntity integration, Map<String, Object> filters) {
        if (integration.getAuthPayload() == null) {
            return Collections.emptyList();
        }

        try {
            JsonNode payloadJson = objectMapper.readTree(integration.getAuthPayload());
            String token = payloadJson.path("accessToken").asText();

            if (token.isEmpty()) {
                return Collections.emptyList();
            }

            String url = mlBaseUrl() + "/orders/search?seller=" + payloadJson.path("sellerId").asText();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
            JsonNode body = response.getBody();

            if (body != null && body.has("results")) {
                List<Map<String, Object>> orders = new ArrayList<>();
                for (JsonNode orderNode : body.get("results")) {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("externalId", orderNode.path("id").asText());
                    orderMap.put("status", orderNode.path("status").asText());
                    orderMap.put("customerNickname", orderNode.path("buyer").path("nickname").asText());
                    orderMap.put("totalAmount", orderNode.path("total_amount").asDouble());
                    orders.add(orderMap);
                }
                return orders;
            }
        } catch (Exception e) {
            log.error("Erro ao buscar pedidos no Mercado Livre", e);
        }
        return Collections.emptyList();
    }
}
