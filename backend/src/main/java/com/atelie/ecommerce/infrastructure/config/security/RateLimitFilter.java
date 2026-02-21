package com.atelie.ecommerce.infrastructure.config.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filtro de Rate Limiting por IP usando Bucket4j (Token Bucket).
 *
 * Protege endpoints sensíveis contra brute force:
 * - /api/auth/login: 10 req/min
 * - /api/auth/register: 5 req/min
 * - /api/newsletter: 5 req/min
 *
 * Demais rotas: sem limitação via este filtro.
 */
@Component
@Order(1)
public class RateLimitFilter implements Filter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        RateConfig config = resolveRateConfig(path, method);
        if (config == null) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(httpRequest);
        String key = clientIp + ":" + config.name;

        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(config));

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                    "{\"error\":\"TOO_MANY_REQUESTS\",\"message\":\"Muitas tentativas. Aguarde antes de tentar novamente.\"}");
        }
    }

    private RateConfig resolveRateConfig(String path, String method) {
        if ("POST".equals(method) && path.startsWith("/api/auth/login")) {
            return new RateConfig("login", 10, Duration.ofMinutes(1));
        }
        if ("POST".equals(method) && path.startsWith("/api/auth/register")) {
            return new RateConfig("register", 5, Duration.ofMinutes(1));
        }
        if ("POST".equals(method) && path.startsWith("/api/newsletter")) {
            return new RateConfig("newsletter", 5, Duration.ofMinutes(1));
        }
        return null;
    }

    private Bucket createBucket(RateConfig config) {
        Bandwidth limit = Bandwidth.classic(config.capacity, Refill.greedy(config.capacity, config.duration));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record RateConfig(String name, long capacity, Duration duration) {
    }
}
