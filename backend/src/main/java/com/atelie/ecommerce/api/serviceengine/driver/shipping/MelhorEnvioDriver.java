package com.atelie.ecommerce.api.serviceengine.driver.shipping;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.api.serviceengine.util.DriverConfigReader;
import com.atelie.ecommerce.domain.provider.RouteContext;
import com.atelie.ecommerce.domain.provider.RuleMatcher;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.shipping.ShippingProviderRepository;
import com.atelie.ecommerce.domain.shipping.model.ShippingProvider;
import com.atelie.ecommerce.infrastructure.shipping.melhorenvio.MelhorEnvioClient;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class MelhorEnvioDriver implements ServiceDriver {

    private final MelhorEnvioClient client;
    private final ProductRepository productRepository;
    private final ShippingProviderRepository shippingProviderRepository;
    private final RuleMatcher ruleMatcher;

    public MelhorEnvioDriver(MelhorEnvioClient client, ProductRepository productRepository,
            ShippingProviderRepository shippingProviderRepository, RuleMatcher ruleMatcher) {
        this.client = client;
        this.productRepository = productRepository;
        this.shippingProviderRepository = shippingProviderRepository;
        this.ruleMatcher = ruleMatcher;
    }

    @Override
    public String driverKey() {
        return "shipping.melhorenvio";
    }

    @Override
    public ServiceType serviceType() {
        return ServiceType.SHIPPING;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        String action = (String) request.getOrDefault("action", "CALCULATE");

        if ("CREATE_REVERSE_LABEL".equalsIgnoreCase(action)) {
            return executeCreateReverseLabel(request, config);
        }

        return executeCalculate(request, config);
    }

    private Map<String, Object> executeCreateReverseLabel(Map<String, Object> request, Map<String, Object> config) {
        try {
            String token = DriverConfigReader.requireString(config, "token");
            Map<String, Object> seller = (Map<String, Object>) config.get("seller");
            Map<String, Object> customer = (Map<String, Object>) request.get("customer");
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
            Integer serviceId = (Integer) request.get("serviceId"); // Ex: 1 (PAC), 2 (SEDEX)

            if (seller == null || customer == null || items == null || serviceId == null) {
                return error("Dados insuficientes para gerar logística reversa (seller, customer, items ou serviceId ausentes)");
            }

            // Para Logística Reversa:
            // FROM = Customer (Remetente original virou destinatário, mas na reversa ele é o remetente)
            // TO = Seller (Ateliê)
            Map<String, Object> payload = new HashMap<>();
            payload.put("service", serviceId);
            payload.put("agency", request.get("agency")); // Opcional para algumas transportadoras

            // Remetente (Cliente)
            payload.put("from", Map.of(
                    "name", customer.get("name"),
                    "email", customer.get("email"),
                    "phone", customer.get("phone"),
                    "document", customer.get("document"),
                    "address", customer.get("address"),
                    "number", customer.get("number"),
                    "district", customer.get("district"),
                    "city", customer.get("city"),
                    "state_abbr", customer.get("state"),
                    "postal_code", customer.get("cep")
            ));

            // Destinatário (Vendedor/Ateliê)
            payload.put("to", Map.of(
                    "name", seller.get("name"),
                    "email", seller.get("email"),
                    "phone", seller.get("phone"),
                    "document", seller.get("document"),
                    "address", seller.get("address"),
                    "number", seller.get("number"),
                    "district", seller.get("district"),
                    "city", seller.get("city"),
                    "state_abbr", seller.get("state"),
                    "postal_code", seller.get("cep")
            ));

            payload.put("products", items);
            payload.put("volumes", request.get("volumes")); // Lista de volumes com weight, height, etc.
            payload.put("options", Map.of("receipt", false, "own_hand", false, "reverse", true));

            // 1. Adicionar ao carrinho
            Map<String, Object> cartResponse = client.addToCart(token, payload);
            String labelId = (String) cartResponse.get("id");

            if (labelId == null) {
                return error("Falha ao adicionar etiqueta ao carrinho Melhor Envio");
            }

            // 2. Checkout (Pagamento/Confirmação)
            Map<String, Object> checkoutPayload = Map.of("orders", List.of(labelId));
            Map<String, Object> checkoutResponse = client.checkout(token, checkoutPayload);

            // 3. Resultado
            Map<String, Object> result = new HashMap<>();
            result.put("label_id", labelId);
            result.put("status", "pending"); // Geralmente pendente até processar
            
            // Tenta extrair o tracking se já disponível
            if (checkoutResponse.containsKey("purchase") && checkoutResponse.get("purchase") instanceof Map) {
                 // Dependendo da resposta do checkout, o tracking pode vir depois via webhook ou polling
                 // Por ora retornamos o que temos
            }

            return result;

        } catch (Exception e) {
            return error("Erro ao gerar logística reversa: " + e.getMessage());
        }
    }

    private Map<String, Object> executeCalculate(Map<String, Object> request, Map<String, Object> config) {
        try {
            String token = DriverConfigReader.requireString(config, "token");
            String originZipCode = DriverConfigReader.requireString(config, "zipCode");
            List<String> allowedCarriers = (List<String>) config.getOrDefault("allowedCarriers",
                    Collections.emptyList());

            String destinationZipCode = (String) request.get("cep");
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.getOrDefault("items",
                    Collections.emptyList());

            if (items.isEmpty())
                return error("Carrinho vazio");

            // 1. Cálculo de Cubagem (Caixa Única)
            BigDecimal totalWeight = BigDecimal.ZERO;
            BigDecimal totalVolume = BigDecimal.ZERO;

            for (Map<String, Object> item : items) {
                UUID productId = UUID.fromString(item.get("productId").toString());
                int quantity = ((Number) item.getOrDefault("quantity", 1)).intValue();

                ProductEntity product = productRepository.findById(productId).orElse(null);
                if (product != null) {
                    BigDecimal weight = product.getWeight() != null ? product.getWeight() : BigDecimal.ZERO;
                    BigDecimal h = product.getHeight() != null ? product.getHeight() : BigDecimal.ONE;
                    BigDecimal w = product.getWidth() != null ? product.getWidth() : BigDecimal.ONE;
                    BigDecimal l = product.getLength() != null ? product.getLength() : BigDecimal.ONE;

                    totalWeight = totalWeight.add(weight.multiply(new BigDecimal(quantity)));
                    BigDecimal vol = h.multiply(w).multiply(l).multiply(new BigDecimal(quantity));
                    totalVolume = totalVolume.add(vol);
                }
            }

            // Heurística de caixa única baseada no volume total (Raiz cúbica para dimensões
            // equilibradas)
            double side = Math.pow(totalVolume.doubleValue(), 1.0 / 3.0);
            BigDecimal dimension = new BigDecimal(Math.max(side, 1.0)).setScale(2, BigDecimal.ROUND_HALF_UP);

            Map<String, Object> packagePayload = new HashMap<>();
            packagePayload.put("weight", totalWeight);
            packagePayload.put("width", dimension);
            packagePayload.put("height", dimension);
            packagePayload.put("length", dimension);

            Map<String, Object> apiRequest = new HashMap<>();
            apiRequest.put("from", Map.of("postal_code", originZipCode));
            apiRequest.put("to", Map.of("postal_code", destinationZipCode));
            apiRequest.put("package", packagePayload);

            // 2. Chamada à API
            List<Map<String, Object>> responses = client.calculate(token, apiRequest);

            // 3. Filtragem e Aplicação de Regras (Frete Grátis via SpEL)
            BigDecimal subtotal = DriverConfigReader.requireMoney(request.get("subtotal"), "subtotal");
            Optional<ShippingProvider> providerOpt = shippingProviderRepository.findByName("Melhor Envio");

            List<Map<String, Object>> filtered = responses.stream()
                    .filter(r -> r.get("error") == null)
                    .filter(r -> r.get("price") != null)
                    .filter(r -> allowedCarriers.isEmpty() || allowedCarriers.contains(r.get("name").toString()))
                    .map(r -> {
                        Map<String, Object> opt = new HashMap<>();
                        String name = r.get("name").toString();
                        BigDecimal originalPrice = toBigDecimal(r.get("price"));

                        boolean isFree = false;
                        if (providerOpt.isPresent()) {
                            ShippingProvider sp = providerOpt.get();
                            if (sp.getRules() != null && !sp.getRules().isEmpty()) {
                                RouteContext routeCtx = new RouteContext("BR", destinationZipCode, subtotal, request);
                                // Se bater em qualquer regra SpEL configurada visualmente, dá frete grátis
                                isFree = sp.getRules().values().stream()
                                        .map(Object::toString)
                                        .anyMatch(spel -> ruleMatcher.matches(routeCtx, spel).matched());
                            }
                        }

                        opt.put("name", name);
                        opt.put("price", isFree ? BigDecimal.ZERO : originalPrice);
                        opt.put("original_price", originalPrice);
                        opt.put("delivery_time", r.get("delivery_time"));
                        opt.put("free_shipping", isFree);
                        return opt;
                    })
                    .collect(Collectors.toList());

            if (filtered.isEmpty())
                return error("Nenhuma transportadora disponível");

            // Retornamos a primeira opção (ou poderíamos modificar o core para retornar
            // lista)
            // Para manter compatibilidade com ShippingQuoteResponse atual:
            Map<String, Object> best = filtered.get(0);
            Map<String, Object> result = new HashMap<>();
            result.put("provider", best.get("name"));
            result.put("cost", best.get("price"));
            result.put("eligible", true);
            result.put("free_shipping", false); // Regras SpEL serão aplicadas no orquestrador/serviço
            result.put("options", filtered); // Passamos a lista completa para o frontend caso ele suporte

            return result;

        } catch (Exception e) {
            return error(e.getMessage());
        }
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null)
            return BigDecimal.ZERO;
        if (val instanceof BigDecimal)
            return (BigDecimal) val;
        try {
            return new BigDecimal(val.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private Map<String, Object> error(String msg) {
        return Map.of("error", true, "message", msg);
    }
}
