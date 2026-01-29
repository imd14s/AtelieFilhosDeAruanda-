package com.atelie.ecommerce.infrastructure.persistence.order;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class OrderRepositoryTest {

    @Test
    void contextLoads() {
        // Se chegou aqui, JPA slice subiu em H2 e NÃO tentou subir EcommerceApplication.
    }
}
