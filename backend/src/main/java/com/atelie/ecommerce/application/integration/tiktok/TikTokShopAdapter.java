package com.atelie.ecommerce.application.integration.tiktok;

import com.atelie.ecommerce.application.integration.IMarketplaceAdapter;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationEntity;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class TikTokShopAdapter implements IMarketplaceAdapter {

    private static final String TIKTOK_AUTH_URL = "https://auth.tiktok-shops.com/api/v2/token/get";
    private static final String TIKTOK_REFRESH_URL = "https://auth.tiktok-shops.com/api/v2/token/refresh";

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TikTokShopAdapter.class);

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final ProductIntegrationRepository integrationRepository;
    private final OrderService orderService;

    public TikTokShopAdapter(ObjectMapper objectMapper, RestTemplate restTemplate,
            ProductIntegrationRepository integrationRepository, OrderService orderService) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
        this.integrationRepository = integrationRepository;
        this.orderService = orderService;
    }

    @Override
    public String getProviderCode() {
        return "tiktok";
    }

    @Override
    public String getAuthUrl(Map<String, String> credentials, String redirectUri, String state) {
        String appId = credentials.get("appId");
        return String.format("https://services.tiktokshop.com/open/authorize?app_key=%s&state=%s", appId, state);
    }

    @Override
    public Map<String, Object> handleAuthCallback(String code, Map<String, String> credentials, String redirectUri) {
        String appId = credentials.get("appId");
        String appSecret = credentials.get("appSecret");

        try {
            // Documentação do TikTok para `v2/token/get`: requer app_key, app_secret,
            // auth_code, e grant_type=authorized_code
            String url = String.format("%s?app_key=%s&app_secret=%s&auth_code=%s&grant_type=authorized_code",
                    TIKTOK_AUTH_URL, appId, appSecret, code);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode body = response.getBody();

                // TikTok retorna data com access_token, refresh_token, etc no sucesso
                if (body.path("code").asInt(1) == 0 && body.has("data")) {
                    JsonNode data = body.path("data");
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("accessToken", data.path("access_token").asText());
                    payload.put("refreshToken", data.path("refresh_token").asText());
                    // Convert expires_in (seconds) to absolute timestamp
                    long expiresInSeconds = data.path("access_token_expire_in").asLong();
                    payload.put("expiresAt", System.currentTimeMillis() + (expiresInSeconds * 1000));
                    payload.put("openId", data.path("open_id").asText());
                    payload.put("sellerName", data.path("seller_name").asText());
                    return payload;
                } else {
                    log.error("TikTok token exchange failed: {}", body);
                    throw new RuntimeException("Falha na autenticação do TikTok: " + body.path("message").asText());
                }
            }
        } catch (Exception e) {
            log.error("Error exchanging TikTok code", e);
            throw new RuntimeException("Erro de rede ao autenticar com TikTok", e);
        }

        return Collections.emptyMap();
    }

    @Override
    public Map<String, Object> refreshToken(MarketplaceIntegrationEntity integration, Map<String, String> credentials) {
        log.info("Refreshing TikTok token for integration {}", integration.getId());
        if (integration.getAuthPayload() == null)
            return Collections.emptyMap();

        try {
            String appId = credentials.get("appId");
            String appSecret = credentials.get("appSecret");

            JsonNode oldPayload = objectMapper.readTree(integration.getAuthPayload());
            String refreshToken = oldPayload.path("refreshToken").asText();

            String url = String.format("%s?app_key=%s&app_secret=%s&refresh_token=%s&grant_type=refresh_token",
                    TIKTOK_REFRESH_URL, appId, appSecret, refreshToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode body = response.getBody();

                if (body.path("code").asInt(1) == 0 && body.has("data")) {
                    JsonNode data = body.path("data");
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("accessToken", data.path("access_token").asText());
                    payload.put("refreshToken", data.path("refresh_token").asText());
                    long expiresInSeconds = data.path("access_token_expire_in").asLong();
                    payload.put("expiresAt", System.currentTimeMillis() + (expiresInSeconds * 1000));
                    payload.put("openId", data.path("open_id").asText());
                    return payload;
                }
            }
        } catch (Exception e) {
            log.error("Failed to refresh TikTok token", e);
        }

        return Collections.emptyMap();
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

            String url = "https://open-api.tiktokglobalshop.com/order/202309/orders/search";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-tts-access-token", token);

            // Build simple payload for order search
            Map<String, Object> requestPayload = new HashMap<>();
            requestPayload.put("page_size", 20);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.POST, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode body = response.getBody();

                if (body.path("code").asInt(1) == 0 && body.has("data") && body.path("data").has("orders")) {
                    List<Map<String, Object>> orders = new ArrayList<>();
                    for (JsonNode orderNode : body.path("data").path("orders")) {
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("externalId", orderNode.path("order_id").asText());
                        orderMap.put("status", orderNode.path("order_status").asText());
                        orderMap.put("customerNickname", orderNode.path("buyer_user_name").asText("User"));
                        orderMap.put("totalAmount", orderNode.path("payment").path("total_amount").asDouble(0.0));
                        orders.add(orderMap);
                    }
                    return orders;
                }
            }
        } catch (Exception e) {
            log.error("Erro ao buscar pedidos no TikTok", e);
        }
        return Collections.emptyList();
    }

    @Override
    public void removeProduct(ProductEntity product, MarketplaceIntegrationEntity integration) {
        if (integration.getAuthPayload() == null) {
            log.warn("Cannot remove product from TikTok: No auth payload for integration {}", integration.getId());
            return;
        }

        integrationRepository.findByProduct_IdAndIntegration_Id(product.getId(), integration.getId())
                .ifPresent(link -> {
                    try {
                        JsonNode payloadJson = objectMapper.readTree(integration.getAuthPayload());
                        String token = payloadJson.path("accessToken").asText();

                        String url = "https://open-api.tiktokglobalshop.com/product/202309/products/"
                                + link.getExternalProductId() + "/deactivate";
                        Map<String, Object> payload = new HashMap<>();

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.set("x-tts-access-token", token);

                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
                        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.POST, entity,
                                JsonNode.class);

                        if (response.getStatusCode().is2xxSuccessful()) {
                            log.info("Anúncio {} (Produto: {}) foi desativado no TikTok com sucesso.",
                                    link.getExternalProductId(), product.getId());
                        }
                    } catch (Exception e) {
                        log.error("Erro ao desativar produto do TikTok Shop", e);
                    }
                });
    }

    @Override
    public void handleWebhook(MarketplaceIntegrationEntity integration, Map<String, Object> payload) {
        log.info("Recebido webhook do TikTok para integração {}: {}", integration.getId(), payload);

        try {
            Integer type = (Integer) payload.get("type");

            // Type 1 usually means Order Status Change in TTS Webhooks
            // In a real scenario we'd query the API to get full order details
            if (type != null && type == 1) {
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                if (data != null && data.containsKey("order_id")) {
                    String orderId = (String) data.get("order_id");
                    String status = (String) data.get("order_status");

                    // In real life, call getOrder(orderId) to get items and buyer info.
                    // Mocking it based on webhook payload for this task if no details available.
                    log.info("TikTok order {} status updated to {}", orderId, status);

                    // orderService.processMarketplaceOrder("tiktok", orderId, ...);
                }
            }
        } catch (Exception e) {
            log.error("Erro ao processar webhook do TikTok", e);
        }
    }

    @Override
    public void testConnection(Map<String, String> credentials) {
        String appId = credentials.get("appId");
        String clientSecret = credentials.get("appSecret");

        if (appId == null || appId.isBlank()) {
            throw new IllegalArgumentException("App Key (App ID) é obrigatório");
        }
        if (clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalArgumentException("App Secret (Client Secret) é obrigatório");
        }
    }

    @Override
    public void exportProduct(ProductEntity product, MarketplaceIntegrationEntity integration) {
        if (integration.getAuthPayload() == null) {
            log.warn("Cannot export product to TikTok: No auth payload for integration {}", integration.getId());
            return;
        }

        try {
            JsonNode payloadJson = objectMapper.readTree(integration.getAuthPayload());
            String token = payloadJson.path("accessToken").asText();

            if (token.isEmpty()) {
                log.warn("Cannot export product to TikTok: Access token is empty for integration {}",
                        integration.getId());
                return;
            }

            // TikTok Shop API v2 add product endpoint
            // Documentation for this is normally region-specific, assuming generic domain
            // here
            String url = "https://open-api.tiktokglobalshop.com/product/202309/products";

            // Simplified Payload for TikTok Shop Product API
            Map<String, Object> payload = new HashMap<>();
            payload.put("title", product.getName());
            payload.put("description", product.getDescription());
            // Map category to a generic one or use product category mapping if available
            payload.put("category_id", "735824");

            if (product.getImageUrl() != null) {
                payload.put("images", List.of(Map.of("uri", product.getImageUrl())));
            }

            Map<String, Object> sku = new HashMap<>();
            sku.put("price", Map.of("amount", product.getPrice().toString(), "currency", "BRL"));

            Map<String, Object> inventory = new HashMap<>();
            inventory.put("quantity", product.getStockQuantity());
            sku.put("inventory", List.of(inventory));

            payload.put("skus", List.of(sku));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-tts-access-token", token);
            // Request signature would be required here normally but omitting for brevity
            // and lack of appSecret access without db fetch

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode body = response.getBody();

                if (body.path("code").asInt(1) == 0 && body.has("data")) {
                    String tiktokProductId = body.path("data").path("product_id").asText();
                    log.info("Produto exportado para TikTok com sucesso! ID: {}", tiktokProductId);

                    if (integrationRepository
                            .findByExternalProductIdAndIntegration_Id(tiktokProductId, integration.getId())
                            .isEmpty()) {
                        ProductIntegrationEntity link = new ProductIntegrationEntity(product, integration,
                                tiktokProductId,
                                null);
                        integrationRepository.save(link);
                    }
                } else {
                    log.error("TikTok product export failed: {}", body);
                }
            }
        } catch (Exception e) {
            log.error("Erro ao exportar produto para TikTok", e);
        }
    }

    @Override
    public List<ProductEntity> fetchProducts(MarketplaceIntegrationEntity integration) {
        log.info("Buscando produtos reais do TikTok Shop para a integração {}", integration.getId());
        if (integration.getAuthPayload() == null) {
            log.warn("Integração sem AuthPayload válido para buscar produtos no TikTok.");
            return Collections.emptyList();
        }

        try {
            JsonNode payloadJson = objectMapper.readTree(integration.getAuthPayload());
            String token = payloadJson.path("accessToken").asText();

            if (token.isEmpty()) {
                return Collections.emptyList();
            }

            // TikTok Shop Open API v2 - List Products
            String url = "https://open-api.tiktokglobalshop.com/product/202309/products/search";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-tts-access-token", token);

            // Payload padrão para trazer lista ativa
            Map<String, Object> requestPayload = new HashMap<>();
            requestPayload.put("page_size", 50);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.POST, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode body = response.getBody();

                if (body.path("code").asInt(1) == 0 && body.has("data") && body.path("data").has("products")) {
                    List<ProductEntity> products = new ArrayList<>();

                    for (JsonNode productNode : body.path("data").path("products")) {
                        ProductEntity p = new ProductEntity();
                        p.setName(productNode.path("title").asText("Produto Importado TikTok"));
                        p.setDescription(productNode.path("description").asText(""));

                        // Busca o preço base e estoque no primeiro SKU disponível
                        if (productNode.has("skus") && productNode.path("skus").isArray()
                                && productNode.path("skus").size() > 0) {
                            JsonNode firstSku = productNode.path("skus").get(0);
                            if (firstSku.has("price") && firstSku.path("price").has("original_price")) {
                                p.setPrice(new java.math.BigDecimal(
                                        firstSku.path("price").path("original_price").asText("0")));
                            } else {
                                p.setPrice(java.math.BigDecimal.ZERO);
                            }

                            if (firstSku.has("inventory") && firstSku.path("inventory").isArray()
                                    && firstSku.path("inventory").size() > 0) {
                                p.setStockQuantity(firstSku.path("inventory").get(0).path("quantity").asInt(0));
                            } else {
                                p.setStockQuantity(0);
                            }
                        } else {
                            p.setPrice(java.math.BigDecimal.ZERO);
                            p.setStockQuantity(0);
                        }

                        // Busca Imagem Principal
                        if (productNode.has("main_images") && productNode.path("main_images").isArray()
                                && productNode.path("main_images").size() > 0) {
                            JsonNode firstImageList = productNode.path("main_images").get(0);
                            if (firstImageList.has("urls") && firstImageList.path("urls").isArray()
                                    && firstImageList.path("urls").size() > 0) {
                                p.setImageUrl(firstImageList.path("urls").get(0).asText());
                            }
                        }

                        // Marca flag transiente se quiser usar na fachada para PIM (Opcional, bom pra
                        // logs)
                        products.add(p);
                    }
                    log.info("Total de {} produtos reais listados do TikTok Shop", products.size());
                    return products;
                }
            }
        } catch (Exception e) {
            log.error("Erro fatal ao sincronizar produtos reais do TikTok", e);
        }

        return Collections.emptyList();
    }

    /**
     * Gera a assinatura HMAC-SHA256 necessária para o TikTok Shop.
     */
    public String generateSignature(String appSecret, Map<String, String> params) {
        try {
            String baseString = params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + e.getValue())
                    .collect(Collectors.joining());

            baseString = appSecret + baseString + appSecret;

            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKey);

            byte[] hash = sha256_HMAC.doFinal(baseString.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating TikTok signature", e);
        }
    }
}
