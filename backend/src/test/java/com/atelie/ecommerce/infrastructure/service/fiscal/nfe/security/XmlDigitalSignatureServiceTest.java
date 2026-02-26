package com.atelie.ecommerce.infrastructure.service.fiscal.nfe.security;

import com.atelie.ecommerce.domain.common.security.SymmetricEncryptionPort;
import com.atelie.ecommerce.domain.fiscal.nfe.security.NfeSignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class XmlDigitalSignatureServiceTest {

    private XmlDigitalSignatureService signatureService;
    private SymmetricEncryptionPort encryptionPortMock;
    private byte[] mockCertificateBytes;

    @BeforeEach
    void setUp() throws Exception {
        encryptionPortMock = Mockito.mock(SymmetricEncryptionPort.class);
        signatureService = new XmlDigitalSignatureService(encryptionPortMock);

        // Load the locally generated PKCS12 from resources
        Path certPath = Paths.get("src/test/resources/fiscal/nfe/security/test-cert.p12");
        if (Files.exists(certPath)) {
            mockCertificateBytes = Files.readAllBytes(certPath);
        } else {
            // Fallback context para dev sem keystore local (não deve ocorrer devido ao
            // setup anterior)
            mockCertificateBytes = new byte[0];
        }
    }

    @Test
    void shouldSuccessfullySignNfeXmlGeneratingSignatureTags() throws Exception {
        // Arrange
        String mockEncryptedPassword = "superEncryptedPassword123";
        // Simulando que quando o mock é chamado, ele devolve a senha real do keystore
        // gerado pelo keytool
        when(encryptionPortMock.decrypt(mockEncryptedPassword)).thenReturn("mockpassword123");

        String rawXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\"><infNFe Id=\"NFe35260212345678000195550010000012341102030405\" versao=\"4.00\"><ide><cUF>35</cUF></ide></infNFe></NFe>";

        // Act
        String signedXml = signatureService.sign(rawXml, mockCertificateBytes, mockEncryptedPassword);

        // Assert
        assertThat(signedXml).isNotBlank();

        // Verifica a não propagação da declaração <?xml... conforme configurado
        assertThat(signedXml).doesNotContain("<?xml version");

        // Verifica as raízes
        assertThat(signedXml).contains("<NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\">");

        // Verifica a montagem correta da tag de Assinatura pelas classes C14N e XMLDSig
        // do Java
        assertThat(signedXml).contains("<Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
        assertThat(signedXml).contains("<SignedInfo>");
        assertThat(signedXml).contains(
                "<CanonicalizationMethod Algorithm=\"http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments\"");
        assertThat(signedXml).contains("<SignatureMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#rsa-sha1\"");

        // Verifica a referência Digest apontando para o infNFe Id
        assertThat(signedXml).contains("<Reference URI=\"#NFe35260212345678000195550010000012341102030405\">");
        assertThat(signedXml).contains("<DigestMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#sha1\"");
        assertThat(signedXml).contains("<DigestValue>");

        // Verifica a tag valiosa de KeyInfo contendo os certificados Base64
        assertThat(signedXml).contains("<KeyInfo>");
        assertThat(signedXml).contains("<X509Data>");
        assertThat(signedXml).contains("<X509Certificate>");
    }

    @Test
    void shouldThrowNfeSignatureExceptionWhenPayloadIsEmpty() {
        assertThatThrownBy(() -> signatureService.sign("", mockCertificateBytes, "pass"))
                .isInstanceOf(NfeSignatureException.class)
                .hasMessageContaining("Conteúdo XML vazio ou nulo");
    }

    @Test
    void shouldThrowNfeSignatureExceptionWhenTagInfNfeIsMissing() throws Exception {
        when(encryptionPortMock.decrypt("mock")).thenReturn("mockpassword123");
        String badXml = "<NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\"><otherTag/></NFe>";

        assertThatThrownBy(() -> signatureService.sign(badXml, mockCertificateBytes, "mock"))
                .isInstanceOf(NfeSignatureException.class)
                .hasMessageContaining("Tag <infNFe> não localizada");
    }

    @Test
    void shouldThrowNfeSignatureExceptionWhenPasswordIsIncorrectForKeyStore() throws Exception {
        // Arrange com senha errada
        when(encryptionPortMock.decrypt("senhaHashErro")).thenReturn("s3nhaErr@d4");
        String rawXml = "<NFe><infNFe Id=\"NFe123\"></infNFe></NFe>";

        // Expect Exception
        assertThatThrownBy(() -> signatureService.sign(rawXml, mockCertificateBytes, "senhaHashErro"))
                .isInstanceOf(NfeSignatureException.class)
                .hasMessageContaining("Falha irrecuperável na extração, digestão ou aplicação do XMLDSig");
    }
}
