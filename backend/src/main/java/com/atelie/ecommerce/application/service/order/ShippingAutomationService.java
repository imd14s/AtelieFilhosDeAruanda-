package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.shipping.melhorenvio.MelhorEnvioClient;
import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.List;

@Service
@Slf4j
public class ShippingAutomationService {

    private final MelhorEnvioClient melhorEnvioClient;
    private final DynamicConfigService configService;
    private final OrderRepository orderRepository;

    public ShippingAutomationService(MelhorEnvioClient melhorEnvioClient,
            DynamicConfigService configService,
            OrderRepository orderRepository) {
        this.melhorEnvioClient = melhorEnvioClient;
        this.configService = configService;
        this.orderRepository = orderRepository;
    }

    public void automateShipping(OrderEntity order) {
        if (!"Melhor Envio".equalsIgnoreCase(order.getShippingProvider())) {
            log.info("Provedor de frete {} não suporta automação automática.", order.getShippingProvider());
            return;
        }

        String token = configService.getString("MELHOR_ENVIO_TOKEN");
        if (token == null || token.isBlank()) {
            log.warn("Token do Melhor Envio não configurado. Automação de etiqueta ignorada.");
            return;
        }

        try {
            // 1. Checkout (Compra a etiqueta)
            // Nota: No mundo real, precisaríamos do ID do carrinho ou criar o envio no
            // carrinho antes.
            // Aqui assumimos que já temos o ID externo se ele foi calculado e guardado em
            // algum lugar,
            // ou faremos o fluxo completo se necessário.
            if (order.getShippingIdExternal() == null) {
                log.warn("ID externo de frete não encontrado para o pedido {}", order.getId());
                return;
            }

            Map<String, Object> checkoutPayload = Map.of("orders", List.of(order.getShippingIdExternal()));
            melhorEnvioClient.checkout(token, checkoutPayload);
            log.info("Etiqueta comprada para o pedido {}", order.getId());

            // 2. Gerar Impressão / PDF
            Map<String, Object> printPayload = Map.of("orders", List.of(order.getShippingIdExternal()));
            Map<String, Object> printResult = melhorEnvioClient.generatePrint(token, printPayload);

            if (printResult.containsKey("url")) {
                order.setLabelUrlMe((String) printResult.get("url"));
            }

            // 3. Definir expiração conforme política (Default 30 dias)
            int retentionDays = (int) configService.getLong("DOCUMENT_RETENTION_DAYS", 30);
            order.setDocumentExpiryDate(Instant.now().plus(retentionDays, ChronoUnit.DAYS));

            orderRepository.save(order);

        } catch (Exception e) {
            log.error("Falha na automação de frete para o pedido {}", order.getId(), e);
        }
    }
}
