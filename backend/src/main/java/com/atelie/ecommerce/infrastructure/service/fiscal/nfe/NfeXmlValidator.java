package com.atelie.ecommerce.infrastructure.service.fiscal.nfe;

import com.atelie.ecommerce.domain.fiscal.nfe.NfeValidationException;
import com.atelie.ecommerce.domain.fiscal.nfe.NfeXmlValidatorPort;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import java.io.IOException;
import java.io.StringReader;

@Service
public class NfeXmlValidator implements NfeXmlValidatorPort {

    // Aponta para o XSD central do Modelo 55 (NF-e)
    private static final String SCHEMA_PATH = "fiscal/nfe/xsd/nfe_v4.00.xsd";

    public void validate(String xmlContent) throws NfeValidationException {
        try {
            SchemaFactory factory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            ClassPathResource schemaResource = new ClassPathResource(SCHEMA_PATH);

            if (!schemaResource.exists()) {
                // Warning em ambiente dev se não quisermos bloquear o build mas idealmente
                // lança Exception.
                // Vamos deixar logado para fallback se arquivo faltar, mas no prod estourar.
                throw new IllegalStateException("Nenhum XSD encontrado no classpath: " + SCHEMA_PATH);
            }

            Schema schema = factory.newSchema(schemaResource.getFile());
            Validator validator = schema.newValidator();

            validator.validate(new StreamSource(new StringReader(xmlContent)));

        } catch (SAXException e) {
            throw new NfeValidationException(
                    "XML da NF-e reprovado nas regras rígidas do XSD. Detalhes: " + e.getMessage(), e);
        } catch (IOException e) {
            throw new NfeValidationException("Falha na varredura/leitura do modelo XML assinado.", e);
        }
    }
}
