package com.atelie.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EcommerceApplicationTests {

    @Test
    void contextLoads() {
        // Se o contexto carregar sem erros, este teste passa.
    }
}
