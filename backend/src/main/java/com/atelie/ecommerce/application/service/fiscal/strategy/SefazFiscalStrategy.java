package com.atelie.ecommerce.application.service.fiscal.strategy;

import com.atelie.ecommerce.application.service.config.SystemConfigService;
import com.atelie.ecommerce.application.service.fiscal.nfe.NfeEmissionOrchestrator;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.domain.fiscal.nfe.NfeCredentials;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.security.EncryptionUtility;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.UUID;

public class SefazFiscalStrategy extends AbstractFiscalStrategy {

    public static final String CONFIG_CERT_BYTES = "FISCAL_CERT_BASE64_ENCRYPTED";
    public static final String CONFIG_CERT_PASSWORD = "FISCAL_CERT_PASSWORD_ENCRYPTED";
    public static final String CONFIG_FISCAL_ENVIRONMENT = "FISCAL_ENVIRONMENT";

    private final OrderService orderService;
    private final NfeEmissionOrchestrator orchestrator;
    private final SystemConfigService configService;
    private final EncryptionUtility encryptionUtility;

    public SefazFiscalStrategy(RestTemplate restTemplate,
            OrderService orderService,
            NfeEmissionOrchestrator orchestrator,
            SystemConfigService configService,
            EncryptionUtility encryptionUtility) {
        super(restTemplate);
        this.orderService = orderService;
        this.orchestrator = orchestrator;
        this.configService = configService;
        this.encryptionUtility = encryptionUtility;
    }

    @Override
    public String getProviderName() {
        return "Sefaz";
    }

    @Override
    public String emitInvoice(UUID orderId) {
        com.atelie.ecommerce.domain.order.model.OrderModel order = orderService.getOrderModelById(orderId);

        // 1. Carregar credenciais cifradas do sistema
        byte[] certBytes = configService.findByKey(CONFIG_CERT_BYTES)
                .map(c -> encryptionUtility.decrypt(Base64.getDecoder().decode(c.value())))
                .orElseThrow(() -> new RuntimeException("Certificado A1 não configurado no sistema."));

        String encryptedPwd = configService.findByKey(CONFIG_CERT_PASSWORD)
                .map(c -> c.value())
                .orElseThrow(() -> new RuntimeException("Senha do certificado não configurada no sistema."));

        boolean isProduction = configService.findByKey(CONFIG_FISCAL_ENVIRONMENT)
                .map(c -> "PRODUCAO".equalsIgnoreCase(c.value()))
                .orElse(false);

        NfeCredentials credentials = new NfeCredentials(certBytes, encryptedPwd, isProduction);

        // 2. Orquestrar emissão via SEFAZ SOAP
        return orchestrator.emit(order, credentials);
    }

    @Override
    public String getInvoicePdfUrl(String externalReference) {
        // O DANFE será gerado sob demanda via rota específica no Controller
        return null;
    }
}
