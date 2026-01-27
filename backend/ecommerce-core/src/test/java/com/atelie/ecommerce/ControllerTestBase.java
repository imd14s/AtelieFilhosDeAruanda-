package com.atelie.ecommerce;

import com.atelie.ecommerce.config.TestInfraConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

// Importa a nossa fábrica de mocks
@AutoConfigureMockMvc(addFilters = false)
@Import(TestInfraConfig.class)
public abstract class ControllerTestBase {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;
    
    // Não precisamos declarar @MockBean aqui, pois o TestInfraConfig já injetou tudo.
}
