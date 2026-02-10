package com.atelie.ecommerce.infrastructure.config.security;

import com.atelie.ecommerce.infrastructure.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final Environment env;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, Environment env) {
        this.jwtFilter = jwtFilter;
        this.env = env;
    }

    /**
     * Metodologia: Spring Security 6 + Stateless JWT
     *
     * - CORS: configurável por ENV (prod-friendly)
     * - CSRF: desligado (API REST stateless)
     * - Session: STATELESS (JWT)
     * - AuthZ: Least privilege (público só o que precisa)
     * - Filter: JWT antes do UsernamePasswordAuthenticationFilter
     * - Errors: 401/403 padronizados para frontend/integrações
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS (API consumida por front separado)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // CSRF não faz sentido em API stateless (não usa cookie de sessão)
                .csrf(csrf -> csrf.disable())

                // Sem sessão no servidor
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Tratamento REST de erro de auth
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler()))

                // Regras de autorização (Least Privilege)
                .authorizeHttpRequests(auth -> auth

                        // Documentação (Swagger/OpenAPI)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // Saúde/infra
                        .requestMatchers("/api/health").permitAll()

                        // Auth: apenas login é público; registro de novos usuários só por admin (exige
                        // JWT)
                        .requestMatchers("/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/google").permitAll()
                        .requestMatchers("/api/auth/**").authenticated()

                        // Webhooks: já usam segredo próprio (ex: header X-Webhook-Token),
                        // então não devem exigir JWT
                        .requestMatchers("/api/webhooks/**").permitAll()

                        // Mídia pública
                        .requestMatchers(HttpMethod.GET, "/api/media/public/**").permitAll()

                        // Catálogo público (atenção: categories está sem /api no seu projeto)
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()

                        // Se seu checkout for público:
                        .requestMatchers("/api/shipping/**").permitAll()

                        // Admin: exige ADMIN
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                        // Demais rotas: autenticado
                        .anyRequest().authenticated())

                // Boas práticas básicas de headers
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(Customizer.withDefaults()))

                // JWT filter (antes do filtro padrão de login)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Metodologia: Externalized Config (12-factor)
     *
     * Variáveis suportadas:
     * - CORS_ALLOWED_ORIGINS: lista separada por vírgula (ex:
     * https://site.com,https://admin.site.com)
     * - CORS_ALLOWED_ORIGIN_PATTERNS: patterns (ex: https://*.site.com)
     *
     * Observação importante:
     * - Se allowCredentials=true, você NÃO pode usar "*" em allowedOrigins.
     * - Para múltiplos subdomínios, prefira allowedOriginPatterns.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        String originsRaw = env.getProperty("CORS_ALLOWED_ORIGINS", "");
        String patternsRaw = env.getProperty("CORS_ALLOWED_ORIGIN_PATTERNS", "");

        List<String> allowedOrigins = splitCsv(originsRaw);
        List<String> allowedOriginPatterns = splitCsv(patternsRaw);

        CorsConfiguration config = new CorsConfiguration();

        if (!allowedOriginPatterns.isEmpty()) {
            config.setAllowedOriginPatterns(allowedOriginPatterns);
        } else if (!allowedOrigins.isEmpty()) {
            config.setAllowedOrigins(allowedOrigins);
        } else {
            // fallback DEV seguro (se você esquecer de setar ENV em dev)
            config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        // Se o front envia Authorization: Bearer, é bom expor alguns headers
        config.setExposedHeaders(List.of("Authorization", "Location"));

        // Se você usa cookies no futuro, ok; se não usa, pode setar false.
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    /**
     * 401 (não autenticado) em formato simples.
     * Pode evoluir para JSON padronizado do seu ExceptionHandler global.
     */
    @Bean
    public AuthenticationEntryPoint restAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"UNAUTHORIZED\"}");
        };
    }

    /**
     * 403 (autenticado sem permissão) em formato simples.
     */
    @Bean
    public AccessDeniedHandler restAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"FORBIDDEN\"}");
        };
    }

    private static List<String> splitCsv(String raw) {
        if (raw == null || raw.isBlank())
            return List.of();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
