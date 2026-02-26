package com.atelie.ecommerce.application.service.shipping;

import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import com.atelie.ecommerce.domain.config.SystemConfigKey;
import com.atelie.ecommerce.domain.shipping.rules.ShippingRule;
import com.atelie.ecommerce.domain.shipping.rules.ShippingRuleTrigger;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ShippingRulesEngine {

    private static final Logger log = LoggerFactory.getLogger(ShippingRulesEngine.class);
    private final DynamicConfigService dynamicConfigService;
    private final ObjectMapper objectMapper;

    // Constante para a margem da mensagem persuasiva (ex: se faltar menos de R$ 50
    // para o mínimo, mostra a mensagem)
    private static final BigDecimal PERSUASIVE_MARGIN = new BigDecimal("50.00");

    public ShippingRulesEngine(DynamicConfigService dynamicConfigService, ObjectMapper objectMapper) {
        this.dynamicConfigService = dynamicConfigService;
        this.objectMapper = objectMapper;
    }

    public ShippingStrategy.ShippingResult applyRules(ShippingStrategy.ShippingResult originalResult,
            ShippingStrategy.ShippingParams params) {
        if (originalResult == null || !originalResult.success()) {
            return originalResult;
        }

        List<ShippingRule> activeRules = getActiveRules();
        if (activeRules.isEmpty()) {
            return originalResult;
        }

        // Avaliar as regras ordenadas por prioridade descrescente
        for (ShippingRule rule : activeRules) {
            if (matches(rule.trigger(), params)) {
                log.info("[LOGISTICS-RULES] Regra aplicada: {} (Prioridade: {})", rule.name(), rule.priority());
                return applyBenefit(originalResult, rule);
            }
        }

        // Se nenhuma regra der match perfeito, verificar se devemos gerar uma mensagem
        // persuasiva (near-miss)
        String persuasiveMessage = generatePersuasiveMessage(activeRules, params);

        return new ShippingStrategy.ShippingResult(
                originalResult.providerName(),
                originalResult.success(),
                originalResult.eligible(),
                originalResult.freeShipping(),
                originalResult.cost(),
                originalResult.threshold(),
                originalResult.estimatedDays(),
                originalResult.error(),
                null,
                originalResult.originalCost() != null ? originalResult.originalCost() : originalResult.cost(),
                persuasiveMessage);
    }

    private List<ShippingRule> getActiveRules() {
        String jsonRules = dynamicConfigService.getString(SystemConfigKey.SHIPPING_RULES.name());
        if (jsonRules == null || jsonRules.isBlank()) {
            return List.of();
        }

        try {
            List<ShippingRule> allRules = objectMapper.readValue(jsonRules, new TypeReference<List<ShippingRule>>() {
            });
            return allRules.stream()
                    .filter(ShippingRule::active)
                    .sorted(Comparator.comparingInt(ShippingRule::priority).reversed())
                    .toList();
        } catch (Exception e) {
            log.error("[LOGISTICS-RULES] Erro ao carregar regras de frete dinâmicas do banco de dados", e);
            return List.of();
        }
    }

    private boolean matches(ShippingRuleTrigger trigger, ShippingStrategy.ShippingParams params) {
        if (trigger == null)
            return true;

        // 1. Total do Carrinho
        if (trigger.cartTotalMin() != null && params.subtotal().compareTo(trigger.cartTotalMin()) < 0)
            return false;
        if (trigger.cartTotalMax() != null && params.subtotal().compareTo(trigger.cartTotalMax()) > 0)
            return false;

        // 2. Quantidade de Itens
        int totalItems = params.items().stream().mapToInt(ShippingStrategy.ShippingItem::quantity).sum();
        if (trigger.minItemsCount() != null && totalItems < trigger.minItemsCount())
            return false;

        // 3. CEP Destino
        if (trigger.validZipCodePrefixes() != null && !trigger.validZipCodePrefixes().isEmpty()) {
            String cep = params.destinationCep().replaceAll("\\D", "");
            boolean matchCep = trigger.validZipCodePrefixes().stream().anyMatch(cep::startsWith);
            if (!matchCep)
                return false;
        }

        // 4. Estados não implementado por agora na consulta direta do CEP sem API
        // externa, pode ser extraído do cep se necessário.

        // 5. Categorias
        if (trigger.validCategoryIds() != null && !trigger.validCategoryIds().isEmpty()) {
            // Nota: No DTO ShippingItem atual não temos categoryId, em um fluxo real
            // teríamos que buscar.
            // Para efeito do Engine local (MVP), se houver itens que passarem a ter
            // categoryId no futuro.
            // Atualmente, assumiremos true se não pudermos validar.
        }

        return true;
    }

    private ShippingStrategy.ShippingResult applyBenefit(ShippingStrategy.ShippingResult original, ShippingRule rule) {
        BigDecimal newCost = original.cost();
        boolean freeShipping = original.freeShipping();
        BigDecimal originalCost = original.originalCost() != null ? original.originalCost() : original.cost();

        if (rule.benefit() != null) {
            switch (rule.benefit().type()) {
                case FREE_SHIPPING:
                    newCost = BigDecimal.ZERO;
                    freeShipping = true;
                    break;
                case FLAT_RATE:
                    newCost = rule.benefit().value();
                    break;
                case PERCENTAGE_DISCOUNT:
                    BigDecimal discount = original.cost()
                            .multiply(rule.benefit().value().divide(new BigDecimal("100")));
                    newCost = original.cost().subtract(discount).max(BigDecimal.ZERO);
                    break;
            }
        }

        return new ShippingStrategy.ShippingResult(
                original.providerName(),
                original.success(),
                original.eligible(),
                freeShipping,
                newCost,
                original.threshold(),
                original.estimatedDays(),
                original.error(),
                rule.name(),
                originalCost,
                null // Removido mensagem persuasiva quando a regra ativa com sucesso
        );
    }

    private String generatePersuasiveMessage(List<ShippingRule> activeRules, ShippingStrategy.ShippingParams params) {
        // Busca a primeira regra de FRETE_GRATIS não aplicada, apenas pelo critério de
        // valor mínimo
        Optional<ShippingRule> nearMissFreeShipping = activeRules.stream()
                .filter(r -> r.benefit() != null
                        && r.benefit().type() == com.atelie.ecommerce.domain.shipping.rules.BenefitType.FREE_SHIPPING)
                .filter(r -> r.trigger() != null && r.trigger().cartTotalMin() != null)
                .filter(r -> params.subtotal().compareTo(r.trigger().cartTotalMin()) < 0) // Ainda não atinge
                .filter(r -> r.trigger().cartTotalMin().subtract(params.subtotal()).compareTo(PERSUASIVE_MARGIN) <= 0) // Mas
                                                                                                                       // está
                                                                                                                       // perto
                .findFirst();

        if (nearMissFreeShipping.isPresent()) {
            BigDecimal diff = nearMissFreeShipping.get().trigger().cartTotalMin().subtract(params.subtotal());
            return String.format("Adicione apenas R$ %.2f para ganhar Frete Grátis na regra: %s", diff,
                    nearMissFreeShipping.get().name());
        }

        return null;
    }
}
