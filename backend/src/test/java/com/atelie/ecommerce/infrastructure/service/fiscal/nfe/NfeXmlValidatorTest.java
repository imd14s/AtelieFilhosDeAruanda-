package com.atelie.ecommerce.infrastructure.service.fiscal.nfe;

import com.atelie.ecommerce.domain.common.exception.NfeValidationException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NfeXmlValidatorTest {

    @Test
    void shouldThrowExceptionWhenSchemaNotFound() {
        // Tentará levantar o XSD físico, mas como ainda não adicionamos na pasta
        // resources do projeto
        // ele cairá na Exception do IllegalState (fallback) para dev environment
        NfeXmlValidator validator = new NfeXmlValidator();

        String dummyXml = "<NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\"><infNFe/></NFe>";

        assertThatThrownBy(() -> validator.validate(dummyXml))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Nenhum XSD encontrado no classpath");
    }
}
