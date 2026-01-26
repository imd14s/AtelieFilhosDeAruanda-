package com.atelie.ecommerce;

import org.springframework.test.context.ActiveProfiles;


import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;


/**
 * TESTE 01 (DDT/TDD) - Smoke Test
 *
 * Objetivo:
 * - Garantir que o contexto do Spring Boot sobe sem erros.
 *
 * Critério de aprovação:
 * - O teste passa se a aplicação inicializar no modo de testes.
 */
@SpringBootTest
@ActiveProfiles("test")


class EcommerceApplicationTests {

    @Test
    void contextLoads() {
        // Se o Spring subir, o teste passa.
    }

}
