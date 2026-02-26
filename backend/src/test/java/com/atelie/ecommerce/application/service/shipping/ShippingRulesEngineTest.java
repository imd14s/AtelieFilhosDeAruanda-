package com.atelie.ecommerce.application.service.shipping;

import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import com.atelie.ecommerce.domain.config.SystemConfigKey;
import com.atelie.ecommerce.domain.shipping.rules.BenefitType;
import com.atelie.ecommerce.domain.shipping.rules.ShippingRule;
import com.atelie.ecommerce.domain.shipping.rules.ShippingRuleBenefit;
import com.atelie.ecommerce.domain.shipping.rules.ShippingRuleTrigger;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShippingRulesEngineTest {

    @Mock
    private DynamicConfigService configService;

    private ObjectMapper objectMapper;

    @InjectMocks
    private ShippingRulesEngine engine;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        engine = new ShippingRulesEngine(configService, objectMapper);
    }

    private void mockConfig(List<ShippingRule> rules) throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(rules);
        when(configService.getString(SystemConfigKey.SHIPPING_RULES.name())).thenReturn(json);
    }

    private ShippingStrategy.ShippingParams createParams(BigDecimal subtotal) {
        return new ShippingStrategy.ShippingParams("01000-000", subtotal, List.of(
                new ShippingStrategy.ShippingItem(UUID.randomUUID(), UUID.randomUUID(), 1, BigDecimal.ONE,
                        BigDecimal.TEN, BigDecimal.TEN, BigDecimal.TEN)),
                "tenant");
    }

    private ShippingStrategy.ShippingResult createOriginalResult(BigDecimal cost) {
        return new ShippingStrategy.ShippingResult("TEST_PROVIDER", true, true, false, cost, BigDecimal.ZERO, "3 dias",
                null, null, cost, null);
    }

    @Test
    void shouldApplyFreeShippingWhenCartTotalExceedsTrigger() throws JsonProcessingException {
        ShippingRule rule = new ShippingRule(UUID.randomUUID(), "FRETE GRATIS > 100", true, 10,
                new ShippingRuleTrigger(new BigDecimal("100.00"), null, null, null, null, null),
                new ShippingRuleBenefit(BenefitType.FREE_SHIPPING, null));

        mockConfig(List.of(rule));

        ShippingStrategy.ShippingResult original = createOriginalResult(new BigDecimal("25.00"));
        ShippingStrategy.ShippingParams params = createParams(new BigDecimal("120.00"));

        ShippingStrategy.ShippingResult modified = engine.applyRules(original, params);

        assertEquals(BigDecimal.ZERO, modified.cost());
        assertTrue(modified.freeShipping());
        assertEquals("FRETE GRATIS > 100", modified.appliedRuleName());
        assertEquals(new BigDecimal("25.00"), modified.originalCost());
        assertNull(modified.persuasiveMessage());
    }

    @Test
    void shouldReturnPersuasiveMessageWhenNearMissFreeShipping() throws JsonProcessingException {
        ShippingRule rule = new ShippingRule(UUID.randomUUID(), "FRETE GRATIS > 100", true, 10,
                new ShippingRuleTrigger(new BigDecimal("100.00"), null, null, null, null, null),
                new ShippingRuleBenefit(BenefitType.FREE_SHIPPING, null));

        mockConfig(List.of(rule));

        ShippingStrategy.ShippingResult original = createOriginalResult(new BigDecimal("25.00"));
        ShippingStrategy.ShippingParams params = createParams(new BigDecimal("80.00")); // Faltam 20

        ShippingStrategy.ShippingResult modified = engine.applyRules(original, params);

        assertEquals(new BigDecimal("25.00"), modified.cost()); // custo mantido
        assertFalse(modified.freeShipping());
        assertNull(modified.appliedRuleName());
        assertEquals(String.format("Adicione apenas R$ %.2f para ganhar Frete Grátis na regra: FRETE GRATIS > 100",
                new BigDecimal("20.00")), modified.persuasiveMessage());
    }

    @Test
    void shouldApplyHighestPriorityRuleWhenMultipleMatches() throws JsonProcessingException {
        ShippingRule rule1 = new ShippingRule(UUID.randomUUID(), "REGRA BAIXA", true, 1,
                new ShippingRuleTrigger(new BigDecimal("50.00"), null, null, null, null, null),
                new ShippingRuleBenefit(BenefitType.FLAT_RATE, new BigDecimal("10.00")));

        ShippingRule rule2 = new ShippingRule(UUID.randomUUID(), "REGRA ALTA", true, 10,
                new ShippingRuleTrigger(new BigDecimal("150.00"), null, null, null, null, null),
                new ShippingRuleBenefit(BenefitType.FREE_SHIPPING, null));

        mockConfig(List.of(rule1, rule2)); // Desordenadas propositalmente (json order doesn't dictate applying order,
                                           // priority does)

        ShippingStrategy.ShippingResult original = createOriginalResult(new BigDecimal("25.00"));
        ShippingStrategy.ShippingParams params = createParams(new BigDecimal("200.00"));

        ShippingStrategy.ShippingResult modified = engine.applyRules(original, params);

        assertEquals(BigDecimal.ZERO, modified.cost());
        assertEquals("REGRA ALTA", modified.appliedRuleName());
    }

    @Test
    void shouldApplyPercentageDiscountCorrectly() throws JsonProcessingException {
        ShippingRule rule = new ShippingRule(UUID.randomUUID(), "DESCONTO 50%", true, 1,
                new ShippingRuleTrigger(null, null, null, List.of("01"), null, null), // CEP SP Capital
                new ShippingRuleBenefit(BenefitType.PERCENTAGE_DISCOUNT, new BigDecimal("50.00")));

        mockConfig(List.of(rule));

        ShippingStrategy.ShippingResult original = createOriginalResult(new BigDecimal("30.00"));
        ShippingStrategy.ShippingParams params = createParams(new BigDecimal("50.00"));

        ShippingStrategy.ShippingResult modified = engine.applyRules(original, params);

        assertEquals(new BigDecimal("15.00").compareTo(modified.cost()), 0); // 50% de 30 é 15
        assertEquals("DESCONTO 50%", modified.appliedRuleName());
    }
}
