package com.atelie.ecommerce.application.integration.tiktok;

import com.atelie.ecommerce.application.integration.IMarketplaceAdapter;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
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

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TikTokShopAdapter.class);

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public TikTokShopAdapter(ObjectMapper objectMapper, RestTemplate restTemplate) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }

    @Override
    public String getProviderCode() {
        return "tiktok";
    }

    @Override
    public String getAuthUrl(Map<String, String> credentials, String redirectUri) {
        String appId = credentials.get("appId");
        return String.format("https://services.tiktokshop.com/open/authorize?app_key=%s&state=auth", appId);
    }

    @Override
    public Map<String, Object> handleAuthCallback(String code, Map<String, String> credentials, String redirectUri) {
        // TikTok implementation for token exchange would go here
        return Collections.emptyMap();
    }

    @Override
    public Map<String, Object> refreshToken(MarketplaceIntegrationEntity integration, Map<String, String> credentials) {
        log.info("Refreshing TikTok token for integration {}", integration.getId());
        // TikTok refresh logic would go here
        return Collections.emptyMap();
    }

    @Override
    public void exportProduct(ProductEntity product, MarketplaceIntegrationEntity integration) {
        if (integration.getEncryptedCredentials() == null) {
            log.warn("Cannot export to TikTok: Credentials missing for integration {}", integration.getId());
            return;
        }

        try {
            // Build Payload (Migrated from TikTokShopIntegrationService)
            Map<String, Object> payload = new HashMap<>();
            payload.put("product_name", product.getName());
            payload.put("description", product.getDescription() != null ? product.getDescription() : "");
            payload.put("category_id", "123456"); // Placeholder: Needs category mapping logic

            if (product.getImageUrl() != null) {
                List<Map<String, String>> images = new ArrayList<>();
                images.add(Map.of("url", product.getImageUrl()));
                payload.put("main_images", images);
            }

            List<Map<String, Object>> skus = new ArrayList<>();
            Map<String, Object> sku = new HashMap<>();
            sku.put("original_price", product.getPrice());
            sku.put("stock_infos", List.of(Map.of("available_stock", product.getStockQuantity())));
            sku.put("seller_sku", product.getId().toString());
            skus.add(sku);
            payload.put("skus", skus);

            String jsonPayload = objectMapper.writeValueAsString(payload);
            log.info("Prepared TikTok export for product {}: {}", product.getId(), jsonPayload);

            // In a real implementation, we would sign the request and send it via
            // restTemplate
            log.info("TikTok export simulated for product {}", product.getId());

        } catch (Exception e) {
            log.error("Failed to export product to TikTok", e);
        }
    }

    @Override
    public List<Map<String, Object>> getOrders(MarketplaceIntegrationEntity integration, Map<String, Object> filters) {
        log.info("Fetching TikTok orders for integration {}", integration.getId());
        // TODO: Implement actual TikTok API call for orders
        return Collections.emptyList();
    }

    @Override
    public void handleWebhook(MarketplaceIntegrationEntity integration, Map<String, Object> payload) {
        log.info("Recebido webhook do TikTok Shop para integração {}: {}", integration.getId(), payload);
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
    public List<ProductEntity> fetchProducts(MarketplaceIntegrationEntity integration) {
        log.info("Fetching products from TikTok Shop for integration {}", integration.getId());

        // Simulação de busca de produtos do TikTok Shop
        // Em uma implementação real, faríamos a chamada à API correspondente
        List<ProductEntity> products = new ArrayList<>();

        ProductEntity p1 = new ProductEntity();
        p1.setName("TikTok Product 1");
        p1.setDescription("Description for TikTok Product 1");
        p1.setPrice(new java.math.BigDecimal("99.90"));
        p1.setStockQuantity(50);
        p1.setImageUrl("https://placehold.co/600x400/000000/FFFFFF?text=TikTok+P1");
        // Usamos MarketplaceIds transiente para sinalizar origem se necessário,
        // ou salvamos o ID externo no ProductIntegrationEntity depois.
        products.add(p1);

        ProductEntity p2 = new ProductEntity();
        p2.setName("TikTok Product 2");
        p2.setDescription("Description for TikTok Product 2");
        p2.setPrice(new java.math.BigDecimal("149.90"));
        p2.setStockQuantity(20);
        p2.setImageUrl("https://placehold.co/600x400/000000/FFFFFF?text=TikTok+P2");
        products.add(p2);

        log.info("Fetched {} products from TikTok Shop", products.size());
        return products;
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
