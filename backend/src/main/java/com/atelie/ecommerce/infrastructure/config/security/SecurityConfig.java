package com.atelie.ecommerce.infrastructure.config.security;

import com.atelie.ecommerce.infrastructure.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final Environment env;
    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(Environment env, JwtAuthenticationFilter jwtFilter) {
        this.env = env;
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/files/view/**").permitAll()

                // 🔐 ADMIN ONLY
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // 🔐 resto exige login
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        String appEnv = env.getProperty("APP_ENV", "dev");
        String raw = env.getProperty("CORS_ALLOWED_ORIGINS", "").trim();

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        if ("dev".equalsIgnoreCase(appEnv)) {
            config.setAllowCredentials(false);
            config.setAllowedOriginPatterns(List.of("*"));
        } else {
            if (raw.isBlank() || "*".equals(raw)) {
                throw new IllegalStateException("CORS_ALLOWED_ORIGINS must be explicitly defined in production");
            }

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
