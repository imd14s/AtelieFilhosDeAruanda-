package com.atelie.ecommerce.domain.provider;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class RuleMatcherTest {

    private final RuleMatcher matcher = new RuleMatcher();

    @Test
    void shouldMatchSpelExpression_whenExpressionIsTrue() {
        RouteContext ctx = new RouteContext("BR", "01001-000", BigDecimal.valueOf(100), Map.of());

        String ruleJson = """
                {"expression":"country == 'BR'"}
                """;

        RuleMatch result = matcher.matches(ctx, ruleJson);

        assertTrue(result.matched());
        assertEquals("spel_matched", result.reason());
    }

    @Test
    void shouldNotMatchSpelExpression_whenExpressionIsFalse() {
        RouteContext ctx = new RouteContext("BR", "01001-000", BigDecimal.valueOf(100), Map.of());

        String ruleJson = """
                {"expression":"country == 'US'"}
                """;

        RuleMatch result = matcher.matches(ctx, ruleJson);

        assertFalse(result.matched());
        assertEquals("spel_mismatch", result.reason());
    }

    @Test
    void shouldMatchLegacyCountryRule_whenCountryMatches() {
        RouteContext ctx = new RouteContext("BR", "01001-000", BigDecimal.valueOf(100), Map.of());

        String ruleJson = """
                {"country":"BR"}
                """;

        RuleMatch result = matcher.matches(ctx, ruleJson);

        assertTrue(result.matched());
        assertEquals("legacy_matched", result.reason());
    }

    @Test
    void shouldNotMatchLegacyRules_whenCepPrefixOrMinTotalMismatch() {
        RouteContext ctx = new RouteContext("BR", "99999-000", BigDecimal.valueOf(50), Map.of());

        // cep_prefix não bate (espera começar com 010 ou 011) e min_total exige >= 100
        String ruleJson = """
                {"country":"BR","cep_prefix":["010","011"],"min_total":100}
                """;

        RuleMatch result = matcher.matches(ctx, ruleJson);

        assertFalse(result.matched());
        // pode falhar primeiro por cep_prefix ou por min_total — ambos são válidos
        assertTrue(
                result.reason().equals("cep_prefix_mismatch") || result.reason().equals("min_total_mismatch"),
                "reason inesperado: " + result.reason()
        );
    }
}
