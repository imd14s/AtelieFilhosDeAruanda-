package com.atelie.ecommerce;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import com.atelie.ecommerce.application.service.integration.N8nService;
import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.infrastructure.security.JwtAuthenticationFilter;
import com.atelie.ecommerce.infrastructure.security.TokenProvider;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@TestConfiguration
@EnableWebSecurity
public class TestMocksConfig {

    @Bean
    @Primary
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean @Primary public AuthenticationManager authenticationManager() { return Mockito.mock(AuthenticationManager.class); }
    // JwtService removido daqui pois a classe foi deletada
    @Bean @Primary public PasswordEncoder passwordEncoder() { return Mockito.mock(PasswordEncoder.class); }
    @Bean @Primary public TokenProvider tokenProvider() { return Mockito.mock(TokenProvider.class); }
    @Bean @Primary public JwtAuthenticationFilter jwtAuthenticationFilter() { return Mockito.mock(JwtAuthenticationFilter.class); }

    @Bean @Primary public OrderRepository orderRepository() { return Mockito.mock(OrderRepository.class); }
    @Bean @Primary public InventoryRepository inventoryRepository() { return Mockito.mock(InventoryRepository.class); }
    @Bean @Primary public SystemConfigRepository systemConfigRepository() { return Mockito.mock(SystemConfigRepository.class); }
    @Bean @Primary public N8nService n8nService() { return Mockito.mock(N8nService.class); }
    @Bean @Primary public DynamicConfigService dynamicConfigService() { return Mockito.mock(DynamicConfigService.class); }
}
