package com.atelie.ecommerce.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync // <--- Agora o @Async do listener funciona de verdade
public class AsyncConfig {
}
