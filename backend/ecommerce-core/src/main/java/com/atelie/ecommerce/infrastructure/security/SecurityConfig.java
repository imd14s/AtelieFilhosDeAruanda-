package com.atelie.ecommerce.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // --- PÚBLICO (Vitrine e Infra) ---
                .requestMatchers("/api/auth/**", "/api/webhooks/**").permitAll()
                .requestMatchers("/api/shipping/quote").permitAll()
                .requestMatchers("/actuator/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers("/uploads/**").permitAll() // Imagens dos produtos
                
                // Leitura de Catálogo (Vitrine) é pública
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/categories/**").permitAll()

                // --- RESTRITO AO ADMIN (Gestão da Loja) ---
                // Qualquer escrita em produtos, estoque, categorias ou acesso ao dashboard/admin
                .requestMatchers("/api/admin/**", "/api/dashboard/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/products/**", "/categories/**", "/api/inventory/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**", "/categories/**", "/api/inventory/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/categories/**").hasRole("ADMIN")
                
                // --- CLIENTE (Autenticado) ---
                // Compras, Perfil, etc.
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
