package com.atelie.ecommerce.domain.provider;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class RuleMatcherTest {

    private final RuleMatcher matcher = new RuleMatcher();

    @Test
    void shouldMatchWhenAllCriteriaPass() {
        RouteContext ctx = new RouteContext("BR", "01123456", new BigDecimal("150.00"));
        String json = """
                {"country":"BR","cep_prefix":["01","02"],"min_total":100.00}
                """;

        RuleMatch r = matcher.matches(ctx, json);

        assertTrue(r.matched());
    }

    @Test
    void shouldRejectOnCountryMismatch() {
        RouteContext ctx = new RouteContext("BR", "01123456", new BigDecimal("150.00"));
        String json = """
                {"country":"US"}
                """;

        RuleMatch r = matcher.matches(ctx, json);

        assertFalse(r.matched());
        assertEquals("country_mismatch", r.reason());
    }

    @Test
    void shouldRejectOnCepPrefixMismatch() {
        RouteContext ctx = new RouteContext("BR", "99123456", new BigDecimal("150.00"));
        String json = """
                {"cep_prefix":["01","02"]}
                """;

        RuleMatch r = matcher.matches(ctx, json);

        assertFalse(r.matched());
        assertEquals("cep_prefix_mismatch", r.reason());
    }

    @Test
    void shouldRejectOnMinTotalMismatch() {
        RouteContext ctx = new RouteContext("BR", "01123456", new BigDecimal("50.00"));
        String json = """
                {"min_total":100.00}
                """;

        RuleMatch r = matcher.matches(ctx, json);

        assertFalse(r.matched());
        assertEquals("min_total_mismatch", r.reason());
    }

    @Test
    void shouldRejectOnInvalidJson() {
        RouteContext ctx = new RouteContext("BR", "01123456", new BigDecimal("150.00"));
        String json = "{ invalid json";

        RuleMatch r = matcher.matches(ctx, json);

        assertFalse(r.matched());
        assertEquals("invalid_match_json", r.reason());
    }
}
