package com.atelie.ecommerce.domain.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Iterator;

public class RuleMatcher {

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * match_json suportado (inicial, simples):
     * {
     *   "country": "BR",
     *   "cep_prefix": ["01","02"],
     *   "min_total": 100.00
     * }
     */
    public RuleMatch matches(RouteContext ctx, String matchJson) {
        try {
            JsonNode root = mapper.readTree(matchJson == null ? "{}" : matchJson);

            // country
            if (root.hasNonNull("country")) {
                String c = root.get("country").asText();
                if (ctx.country() == null || !c.equalsIgnoreCase(ctx.country())) {
                    return new RuleMatch(false, "country_mismatch");
                }
            }

            // cep_prefix
            if (root.hasNonNull("cep_prefix")) {
                if (ctx.cep() == null) return new RuleMatch(false, "cep_missing");
                boolean ok = false;
                Iterator<JsonNode> it = root.get("cep_prefix").elements();
                while (it.hasNext()) {
                    String prefix = it.next().asText();
                    if (ctx.cep().startsWith(prefix)) { ok = true; break; }
                }
                if (!ok) return new RuleMatch(false, "cep_prefix_mismatch");
            }

            // min_total
            if (root.hasNonNull("min_total")) {
                BigDecimal min = new BigDecimal(root.get("min_total").asText());
                BigDecimal total = ctx.cartTotal() == null ? BigDecimal.ZERO : ctx.cartTotal();
                if (total.compareTo(min) < 0) return new RuleMatch(false, "min_total_mismatch");
            }

            return new RuleMatch(true, "matched");
        } catch (Exception e) {
            return new RuleMatch(false, "invalid_match_json");
        }
    }
}
