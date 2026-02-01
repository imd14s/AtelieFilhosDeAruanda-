package com.atelie.ecommerce.infrastructure.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final Environment env;

    public SecurityConfig(Environment env) {
        this.env = env;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // API stateless
            .csrf(AbstractHttpConfigurer::disable)

            // CORS via ENV
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/files/view/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ENV: CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
        // Ou "*" para liberar tudo em dev.
        String raw = env.getProperty("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").trim();

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        if ("*".equals(raw)) {
            // Com credenciais, "*" em allowedOrigins não é aceito.
            // Para dev, liberamos tudo via pattern e desabilitamos credenciais.
            config.setAllowCredentials(false);
            config.setAllowedOriginPatterns(List.of("*"));
        } else {
            config.setAllowCredentials(true);
            List<String> origins = Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());

            origins.forEach(config::addAllowedOrigin);
        }

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
