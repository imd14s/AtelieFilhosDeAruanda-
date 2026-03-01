package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.Optional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;

/**
 * Client para gerenciar Customers na API do Mercado Pago.
 * Um Customer MP é necessário para vincular cartões tokenizados.
 */
@Service
public class MercadoPagoCustomerClient {

    private final RestTemplate restTemplate;
    private final Environment env;
    private final UserRepository userRepository;
    private final ServiceProviderConfigGateway configGateway;
    private final ObjectMapper objectMapper;

    public MercadoPagoCustomerClient(
            RestTemplate restTemplate,
            Environment env,
            UserRepository userRepository,
            ServiceProviderConfigGateway configGateway,
            ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.env = env;
        this.userRepository = userRepository;
        this.configGateway = configGateway;
        this.objectMapper = objectMapper;
    }

    /**
     * Busca ou cria um Customer no Mercado Pago para o usuário.
     * Salva o mpCustomerId no banco se for criado.
     */
    public String getOrCreateCustomerId(UserEntity user) {
        if (user.getMpCustomerId() != null && !user.getMpCustomerId().isBlank()) {
            return user.getMpCustomerId();
        }

        String accessToken = getAccessToken();
        if (accessToken == null) {
            org.slf4j.LoggerFactory.getLogger(MercadoPagoCustomerClient.class)
                    .warn("[DEBUG] MP_ACCESS_TOKEN não configurado ou vazio.");
            return null;
        }
        String baseUrl = getBaseUrl();
        org.slf4j.LoggerFactory.getLogger(MercadoPagoCustomerClient.class).info(
                "[DEBUG] Iniciando getOrCreateCustomerId para usuário: {}, usando base URL: {}", user.getEmail(),
                baseUrl);

        // Tenta buscar por email
        String searchUrl = baseUrl + "/v1/customers/search?email=" + user.getEmail();
        HttpEntity<Void> searchEntity = new HttpEntity<>(buildHeaders(accessToken));

        try {
            Map response = restTemplate.exchange(searchUrl, HttpMethod.GET, searchEntity, Map.class).getBody();
            List<Map> results = (List<Map>) response.get("results");
            if (results != null && !results.isEmpty()) {
                String customerId = String.valueOf(results.get(0).get("id"));
                user.setMpCustomerId(customerId);
                userRepository.save(user);
                return customerId;
            }
        } catch (Exception e) {
            // Se busca falhou, tenta criar
        }

        // Cria novo customer
        String createUrl = baseUrl + "/v1/customers";
        Map<String, Object> body = new HashMap<>();
        body.put("email", user.getEmail());
        body.put("first_name", user.getName().split(" ")[0]);
        if (user.getName().contains(" ")) {
            body.put("last_name", user.getName().substring(user.getName().indexOf(' ') + 1));
        }

        try {
            HttpEntity<Map<String, Object>> createEntity = new HttpEntity<>(body, buildHeaders(accessToken));
            Map createResponse = restTemplate.postForObject(createUrl, createEntity, Map.class);

            if (createResponse != null) {
                String customerId = String.valueOf(createResponse.get("id"));
                user.setMpCustomerId(customerId);
                userRepository.save(user);
                return customerId;
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(MercadoPagoCustomerClient.class)
                    .error("[DEBUG] Erro ao criar customer no Mercado Pago: {}", e.getMessage());
        }

        return null; // Falha silenciosa se não configurado ou erro na API
    }

    /**
     * Lista os cartões salvos de um Customer no Mercado Pago.
     */
    public List<Map<String, Object>> listCards(String customerId) {
        if (customerId == null || customerId.isBlank())
            return Collections.emptyList();
        String accessToken = getAccessToken();
        if (accessToken == null) {
            org.slf4j.LoggerFactory.getLogger(MercadoPagoCustomerClient.class)
                    .warn("[DEBUG] MP_ACCESS_TOKEN não configurado. Abortando listagem de cartões.");
            return Collections.emptyList();
        }
        String url = getBaseUrl() + "/v1/customers/" + customerId + "/cards";
        HttpEntity<Void> entity = new HttpEntity<>(buildHeaders(accessToken));

        try {
            List response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class).getBody();
            return response != null ? response : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    /**
     * Salva um card_token (gerado no frontend via MercadoPago.js SDK)
     * como cartão do Customer para cobranças futuras.
     */
    public Map<String, Object> saveCard(String customerId, String cardToken) {
        String accessToken = getAccessToken();
        if (accessToken == null) {
            org.slf4j.LoggerFactory.getLogger(MercadoPagoCustomerClient.class)
                    .error("[DEBUG] MP_ACCESS_TOKEN não configurado. Não é possível salvar cartão.");
            return Map.of("error", "CONFIG_MISSING", "message", "Configuração de pagamento incompleta.");
        }
        String url = getBaseUrl() + "/v1/customers/" + customerId + "/cards";

        Map<String, String> body = Map.of("token", cardToken);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, buildHeaders(accessToken));

        return restTemplate.postForObject(url, entity, Map.class);
    }

    /**
     * Remove um cartão salvo do Customer.
     */
    public void deleteCard(String customerId, String cardId) {
        String accessToken = getAccessToken();
        if (accessToken == null)
            return;
        String url = getBaseUrl() + "/v1/customers/" + customerId + "/cards/" + cardId;
        HttpEntity<Void> entity = new HttpEntity<>(buildHeaders(accessToken));
        restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
    }

    private HttpHeaders buildHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        return headers;
    }

    private String getAccessToken() {
        // 1. Tenta buscar em PRODUCTION no banco
        Optional<String> productionJson = configGateway.findConfigJson("MERCADO_PAGO", "PRODUCTION");
        if (productionJson.isPresent()) {
            String token = extractTokenFromJson(productionJson.get());
            if (token != null && !token.isBlank()) {
                return token;
            }
        }

        // 2. Tenta buscar em SANDBOX no banco
        Optional<String> sandboxJson = configGateway.findConfigJson("MERCADO_PAGO", "SANDBOX");
        if (sandboxJson.isPresent()) {
            String token = extractTokenFromJson(sandboxJson.get());
            if (token != null && !token.isBlank()) {
                return token;
            }
        }

        // 3. Fallback para variável de ambiente (legado)
        String token = env.getProperty("MP_ACCESS_TOKEN");
        if (token == null || token.isBlank()) {
            return null;
        }
        return token;
    }

    private String extractTokenFromJson(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            return root.path("credentials").path("accessToken").asText();
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(MercadoPagoCustomerClient.class)
                    .error("[DEBUG] Erro ao extrair accessToken do JSON: {}", e.getMessage());
            return null;
        }
    }

    private String getBaseUrl() {
        String url = env.getProperty("MP_API_URL", "https://api.mercadopago.com");
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
