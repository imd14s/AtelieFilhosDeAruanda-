package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.api.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.api.serviceengine.ServiceResult;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemEntity;
import com.atelie.ecommerce.api.config.DynamicConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class ReverseLogisticsService {

    private final ServiceOrchestrator orchestrator;
    private final OrderRepository orderRepository;
    private final DynamicConfigService configService;

    public ReverseLogisticsService(ServiceOrchestrator orchestrator, 
                                 OrderRepository orderRepository,
                                 DynamicConfigService configService) {
        this.orchestrator = orchestrator;
        this.orderRepository = orderRepository;
        this.configService = configService;
    }

    @Transactional
    public Map<String, Object> createReverseLabel(UUID orderId, Integer serviceId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado: " + orderId));

        log.info("[REVERSE-LOGISTICS] Iniciando geração de etiqueta reversa para pedido {}", orderId);

        Map<String, Object> request = new HashMap<>();
        request.put("action", "CREATE_REVERSE_LABEL");
        request.put("serviceId", serviceId);

        // Dados do Cliente (Remetente na Reversa)
        Map<String, Object> customer = new HashMap<>();
        customer.put("name", order.getCustomerName());
        customer.put("email", order.getCustomerEmail());
        customer.put("cep", order.getShippingZipCode());
        customer.put("address", order.getShippingStreet());
        customer.put("number", order.getShippingNumber());
        customer.put("district", order.getShippingNeighborhood());
        customer.put("city", order.getShippingCity());
        customer.put("state", order.getShippingState());
        // Nota: Idealmente teríamos telefone e documento no OrderEntity ou UserEntity
        customer.put("phone", configService.get("CUSTOMER_DEFAULT_PHONE", "11999999999"));
        customer.put("document", configService.get("CUSTOMER_DEFAULT_DOC", "00000000000"));
        request.put("customer", customer);

        // Dados do Vendedor (Destinatário na Reversa)
        Map<String, Object> seller = new HashMap<>();
        seller.put("name", configService.get("STORE_NAME", "Ateliê Filhos de Aruanda"));
        seller.put("email", configService.get("STORE_EMAIL", "contato@ateliefilhosdearuanda.com.br"));
        seller.put("phone", configService.get("STORE_PHONE", "11999999999"));
        seller.put("document", configService.get("STORE_CNPJ", "00000000000100"));
        seller.put("cep", configService.get("STORE_CEP", "01001000"));
        seller.put("address", configService.get("STORE_ADDRESS", "Rua Exemplo"));
        seller.put("number", configService.get("STORE_NUMBER", "123"));
        seller.put("district", configService.get("STORE_DISTRICT", "Centro"));
        seller.put("city", configService.get("STORE_CITY", "São Paulo"));
        seller.put("state", configService.get("STORE_STATE", "SP"));
        request.put("seller", seller);

        // Itens
        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItemEntity item : order.getItems()) {
            items.add(Map.of(
                    "name", item.getProductName(),
                    "quantity", item.getQuantity(),
                    "unit_value", item.getUnitPrice()
            ));
        }
        request.put("items", items);

        // Volumes (Simplificado: 1 volume com peso/dimensões aproximadas ou baseadas nos produtos)
        // No mundo real, calcularíamos cubagem real.
        request.put("volumes", List.of(Map.of(
                "weight", 1.0,
                "width", 20,
                "height", 20,
                "length", 20
        )));

        ServiceResult result = orchestrator.execute(ServiceType.SHIPPING, request, "PRODUCTION");

        if (result.success()) {
            String trackingCode = (String) result.payload().get("tracking_code");
            if (trackingCode != null) {
                order.setReverseTrackingCode(trackingCode);
                orderRepository.save(order);
            }
            log.info("[REVERSE-LOGISTICS] Etiqueta reversa gerada com sucesso para pedido {}", orderId);
            return result.payload();
        } else {
            log.error("[REVERSE-LOGISTICS] Falha ao gerar etiqueta reversa: {}", result.payload().get("message"));
            return Map.of("error", true, "message", result.payload().get("message"));
        }
    }
}
