package com.atelie.ecommerce.domain.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.SimpleEvaluationContext; // Import Seguro
import java.util.Iterator;

public class RuleMatcher {

    private final ObjectMapper mapper = new ObjectMapper();
    private final ExpressionParser parser = new SpelExpressionParser();

    public RuleMatch matches(RouteContext ctx, String matchJson) {
        try {
            if (matchJson == null || matchJson.isBlank()) {
                return new RuleMatch(false, "empty_rule");
            }

            JsonNode root = mapper.readTree(matchJson);

            // 1. SpEL (Modo Seguro - Read Only)
            if (root.hasNonNull("expression")) {
                String expressionString = root.get("expression").asText();
                
                if (expressionString == null || expressionString.isBlank()) {
                    return new RuleMatch(false, "empty_expression");
                }
                
                // BLINDAGEM: SimpleEvaluationContext impede execução de métodos arbitrários
                SimpleEvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding()
                        .withRootObject(ctx != null ? ctx : new Object()) // Define #ctx como raiz
                        .build();
                        
                // Disponibiliza a variável #ctx explicitamente também
                if (ctx != null) {
                    context.setVariable("ctx", ctx);
                }

                Expression exp = parser.parseExpression(expressionString);
                Boolean result = exp.getValue(context, Boolean.class);

                if (Boolean.TRUE.equals(result)) return new RuleMatch(true, "spel_matched");
                else return new RuleMatch(false, "spel_mismatch");
            }

            // 2. Legado (Retrocompatibilidade)
            if (root.hasNonNull("country")) {
                String c = root.get("country").asText();
                if (ctx.country() == null || !c.equalsIgnoreCase(ctx.country())) {
                    return new RuleMatch(false, "country_mismatch");
                }
            }
            
            if (root.hasNonNull("cep_prefix") && root.get("cep_prefix").isArray()) {
                boolean prefixMatch = false;
                String ctxCep = ctx.cep() != null ? ctx.cep().replaceAll("\\D+", "") : "";
                Iterator<JsonNode> elements = root.get("cep_prefix").elements();
                while (elements.hasNext()) {
                    if (ctxCep.startsWith(elements.next().asText())) {
                        prefixMatch = true;
                        break;
                    }
                }
                if (!prefixMatch) return new RuleMatch(false, "cep_prefix_mismatch");
            }
            
            if (root.hasNonNull("min_total")) {
                double min = root.get("min_total").asDouble();
                if (ctx.cartTotal() == null || ctx.cartTotal().doubleValue() < min) {
                    return new RuleMatch(false, "min_total_mismatch");
                }
            }

            return new RuleMatch(true, "legacy_matched");

        } catch (Exception e) {
            System.err.println("Erro ao avaliar regra: " + e.getMessage());
            return new RuleMatch(false, "invalid_match_json");
        }
    }
}
