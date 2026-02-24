package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.UUID;

@Service
public class InvoiceService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(InvoiceService.class);

    private final FiscalProviderFactory factory;

    public InvoiceService(FiscalProviderFactory factory) {
        this.factory = factory;
    }

    public void emitInvoiceForOrder(UUID orderId) {
        factory.getActiveProvider().ifPresentOrElse(
                provider -> {
                    log.info("Solicitando emissão de nota via {}", provider.getProviderName());
                    try {
                        String reference = provider.emitInvoice(orderId);
                        log.info("Requisição enviada com sucesso. Referência: {}", reference);
                        // Aqui poderíamos salvar a referência no banco se necessário
                    } catch (Exception e) {
                        log.error("Erro ao emitir nota via {}", provider.getProviderName(), e);
                    }
                },
                () -> log.warn("Nenhum provedor fiscal ativo encontrado. Emissão de NF-e ignorada."));
    }
}
