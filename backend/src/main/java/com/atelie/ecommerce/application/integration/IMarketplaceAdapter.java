package com.atelie.ecommerce.application.integration;

import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import java.util.Map;
import java.util.List;

public interface IMarketplaceAdapter {
    /**
     * Retorna o código do provedor (ex: tiktok, mercadolivre)
     */
    String getProviderCode();

    /**
     * Gera a URL de login OAuth.
     */
    String getAuthUrl(Map<String, String> credentials, String redirectUri, String state);

    /**
     * Troca o code pelo Access Token e Refresh Token.
     */
    Map<String, Object> handleAuthCallback(String code, Map<String, String> credentials, String redirectUri);

    /**
     * Lógica para renovar o token expirado.
     */
    Map<String, Object> refreshToken(MarketplaceIntegrationEntity integration, Map<String, String> credentials);

    /**
     * Exporta ou atualiza um produto no marketplace.
     */
    void exportProduct(ProductEntity product, MarketplaceIntegrationEntity integration);

    /**
     * Remove ou inativa um produto remotamente do marketplace.
     */
    void removeProduct(ProductEntity product, MarketplaceIntegrationEntity integration);

    /**
     * Busca padronizada de pedidos.
     */
    List<? extends Object> getOrders(MarketplaceIntegrationEntity integration, Map<String, Object> filters);

    /**
     * Processa notificações de webhooks específicos.
     */
    void handleWebhook(MarketplaceIntegrationEntity integration, Map<String, Object> payload);

    /**
     * Testa a conexão com as credenciais fornecidas.
     * Deve lançar exceção se as credenciais forem inválidas.
     */
    void testConnection(Map<String, String> credentials);

    /**
     * Busca produtos no marketplace.
     */
    List<ProductEntity> fetchProducts(MarketplaceIntegrationEntity integration);
}
