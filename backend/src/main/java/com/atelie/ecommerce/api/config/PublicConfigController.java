package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/config/public")
public class PublicConfigController {

    private static final Logger log = LoggerFactory.getLogger(PublicConfigController.class);

    private final ServiceProviderConfigGateway configGateway;
    private final ObjectMapper objectMapper;

    public PublicConfigController(ServiceProviderConfigGateway configGateway, ObjectMapper objectMapper) {
        this.configGateway = configGateway;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/mercado-pago/public-key")
    public ResponseEntity<Map<String, Object>> getMercadoPagoPublicKey() {
        log.info("[DEBUG] Iniciando busca da chave pública do Mercado Pago");

        // Tenta buscar em PRODUCTION primeiro
        return findConfigForEnvironment("PRODUCTION")
                .or(() -> {
                    log.info("[DEBUG] Chave de PRODUCTION não encontrada, tentando fallback para SANDBOX");
                    return findConfigForEnvironment("SANDBOX");
                })
                .orElseGet(() -> {
                    log.warn(
                            "[DEBUG] Nenhuma configuração de Mercado Pago (PRODUCTION ou SANDBOX) encontrada no banco.");
                    Map<String, Object> errorMap = new HashMap<>();
                    errorMap.put("error", "CONFIG_MISSING");
                    errorMap.put("message", "A configuração de pagamento ainda não foi realizada pelo administrador.");
                    return ResponseEntity.status(404).body(errorMap);
                });
    }

    private Optional<ResponseEntity<Map<String, Object>>> findConfigForEnvironment(String env) {
        return configGateway.findConfigJson("MERCADO_PAGO", env)
                .map(json -> {
                    try {
                        log.debug("[DEBUG] JSON bruto recuperado para ambiente {}: {}", env, json);
                        JsonNode root = objectMapper.readTree(json);
                        String publicKey = root.path("credentials").path("publicKey").asText();

                        if (publicKey == null || publicKey.isBlank()) {
                            log.warn("[DEBUG] Chave pública encontrada no ambiente {} está vazia ou nula", env);
                            return null; // Força entrar no fallback/orElse do Optional externo
                        }

                        boolean pixActive = false;
                        double pixDiscountPercent = 0.0;
                        boolean cardActive = false;
                        int maxInstallments = 12;
                        int interestFree = 1;

                        JsonNode methodsNode = root.path("methods").path("enabled");
                        if (!methodsNode.isMissingNode()) {
                            JsonNode pixNode = methodsNode.path("pix");
                            if (!pixNode.isMissingNode()) {
                                pixActive = pixNode.path("active").asBoolean(false);
                                pixDiscountPercent = pixNode.path("discountPercent").asDouble(0.0);
                            }

                            JsonNode cardNode = methodsNode.path("card");
                            if (!cardNode.isMissingNode()) {
                                cardActive = cardNode.path("active").asBoolean(false);
                                maxInstallments = cardNode.path("maxInstallments").asInt(12);
                                interestFree = cardNode.path("interestFree").asInt(1);
                            }
                        }

                        Map<String, Object> responseConfig = new HashMap<>();
                        responseConfig.put("publicKey", publicKey);
                        responseConfig.put("env", env);
                        responseConfig.put("pixActive", pixActive);
                        responseConfig.put("pixDiscountPercent", pixDiscountPercent);
                        responseConfig.put("cardActive", cardActive);
                        responseConfig.put("maxInstallments", maxInstallments);
                        responseConfig.put("interestFree", interestFree);

                        return ResponseEntity.ok(responseConfig);
                    } catch (Exception e) {
                        log.error("[DEBUG] Erro ao processar JSON para ambiente {}: {}", env, e.getMessage());
                        return null;
                    }
                });
    }
}
