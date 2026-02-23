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
    public ResponseEntity<Map<String, String>> getMercadoPagoPublicKey() {
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
                            return ResponseEntity.notFound().<Map<String, String>>build();
                        }

                        return ResponseEntity.ok(Map.of("publicKey", publicKey));
                    } catch (Exception e) {
                        log.error("[DEBUG] Erro catastrófico ao processar JSON: {}", e.getMessage(), e);
                        return ResponseEntity.internalServerError().<Map<String, String>>build();
                    }
                })
                .orElseGet(() -> {
                    log.warn("[DEBUG] Configuração MERCADO_PAGO/PRODUCTION não encontrada no banco");
                    return ResponseEntity.notFound().build();
                });
    }
}
