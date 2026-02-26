package com.atelie.ecommerce.application.serviceengine.driver.shipping;

import com.atelie.ecommerce.application.serviceengine.ServiceDriver;
import com.atelie.ecommerce.application.serviceengine.util.DriverConfigReader;
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
