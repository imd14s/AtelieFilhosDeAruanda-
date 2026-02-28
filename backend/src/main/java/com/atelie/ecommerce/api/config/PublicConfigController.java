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
        return configGateway.findConfigJson("MERCADO_PAGO", "PRODUCTION")
                .map(json -> {
                    try {
                        log.debug("[DEBUG] JSON bruto recuperado: {}", json);
                        JsonNode root = objectMapper.readTree(json);
                        String publicKey = root.path("credentials").path("publicKey").asText();
                        log.info("[DEBUG] Chave pública extraída com sucesso");

                        if (publicKey == null || publicKey.isBlank()) {
                            log.warn("[DEBUG] Chave pública encontrada está vazia ou nula no JSON");
                            return ResponseEntity.notFound().<Map<String, Object>>build();
                        }

                        boolean pixActive = false;
                        double pixDiscountPercent = 0.0;
                        boolean cardActive = false;
                        int maxInstallments = 12;

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
                            }
                        }

                        Map<String, Object> responseConfig = new HashMap<>();
                        responseConfig.put("publicKey", publicKey);
                        responseConfig.put("pixActive", pixActive);
                        responseConfig.put("pixDiscountPercent", pixDiscountPercent);
                        responseConfig.put("cardActive", cardActive);
                        responseConfig.put("maxInstallments", maxInstallments);

                        return ResponseEntity.ok(responseConfig);
                    } catch (Exception e) {
                        log.error("[DEBUG] Erro catastrófico ao processar JSON: {}", e.getMessage(), e);
                        return ResponseEntity.internalServerError().<Map<String, Object>>build();
                    }
                })
                .orElseGet(() -> {
                    log.warn(
                            "[DEBUG] Configuração MERCADO_PAGO/PRODUCTION não encontrada no banco. O administrador ainda não configurou as chaves.");
                    Map<String, Object> errorMap = new HashMap<>();
                    errorMap.put("error", "CONFIG_MISSING");
                    errorMap.put("message", "A configuração de pagamento ainda não foi realizada pelo administrador.");
                    return ResponseEntity.status(404).body(errorMap);
                });
    }
}
