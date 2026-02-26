package com.atelie.ecommerce.infrastructure.service.fiscal.nfe.integration;

import com.atelie.ecommerce.domain.common.security.SymmetricEncryptionPort;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazCommunicationException;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazRejectionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SefazSoapClientTest {

    private SefazSoapClient sefazClient;
    private SymmetricEncryptionPort encryptionPortMock;
    private SefazEndpointsRegistry endpointsRegistryMock;
    private RestTemplate mtlsTemplateMock;
    private byte[] mockCertificateBytes;

    @BeforeEach
    void setUp() throws Exception {
        encryptionPortMock = mock(SymmetricEncryptionPort.class);
        endpointsRegistryMock = mock(SefazEndpointsRegistry.class);
        mtlsTemplateMock = mock(RestTemplate.class);

        // Anon class to override the MTLS builder
        sefazClient = new SefazSoapClient(encryptionPortMock, endpointsRegistryMock) {
            @Override
            RestTemplate buildMtlsRestTemplate(byte[] p12Bytes, String encryptedPassword) throws Exception {
                return mtlsTemplateMock;
            }
        };

        Path certPath = Paths.get("src/test/resources/fiscal/nfe/security/test-cert.p12");
        if (Files.exists(certPath)) {
            mockCertificateBytes = Files.readAllBytes(certPath);
        } else {
            mockCertificateBytes = new byte[0];
        }

        when(endpointsRegistryMock.getNfeAutorizacaoUrl(anyString(), eq(false)))
                .thenReturn("https://homologacao.sefaz.gov.br/autorizacao");
        when(endpointsRegistryMock.getNfeStatusUrl(anyString(), eq(true))).thenReturn("https://sefaz.gov.br/status");
    }

    @Test
    void shouldAuthorizeNFeSuccessfully() throws Exception {
        String mockEncryptedPassword = "encrypted123";
        when(encryptionPortMock.decrypt(mockEncryptedPassword)).thenReturn("mockpassword123");

        String mockSefazResponse = "<soap12:Envelope xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\"><soap12:Body><nfeResultMsg><retEnviNFe xmlns=\"http://www.portalfiscal.inf.br/nfe\" versao=\"4.00\"><cStat>104</cStat><xMotivo>Lote processado</xMotivo></retEnviNFe></nfeResultMsg></soap12:Body></soap12:Envelope>";

        when(mtlsTemplateMock.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok(mockSefazResponse));

        String result = sefazClient.authorizeNfe("<Signature>...</Signature>", "SP", false, mockCertificateBytes,
                mockEncryptedPassword);

        assertThat(result).contains("104");
        assertThat(result).contains("Lote processado");
    }

    @Test
    void shouldThrowRejectionExceptionWhenSefazReturnsBusinessRuleError() throws Exception {
        String mockEncryptedPassword = "encrypted123";
        when(encryptionPortMock.decrypt(mockEncryptedPassword)).thenReturn("mockpass");

        String mockSefazResponse = "<soap12:Envelope><soap12:Body><nfeResultMsg><retEnviNFe versao=\"4.00\"><cStat>539</cStat><xMotivo>Rejeição: Duplicidade de NFe</xMotivo></retEnviNFe></nfeResultMsg></soap12:Body></soap12:Envelope>";

        when(mtlsTemplateMock.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok(mockSefazResponse));

        assertThatThrownBy(() -> sefazClient.authorizeNfe("<Signature>...</Signature>", "RJ", false,
                mockCertificateBytes, mockEncryptedPassword))
                .isInstanceOf(SefazRejectionException.class)
                .hasMessageContaining("rejeitou o documento por quebra de regra de negócio")
                .satisfies(exception -> {
                    SefazRejectionException sefazEx = (SefazRejectionException) exception;
                    assertThat(sefazEx.getCStat()).isEqualTo("539");
                    assertThat(sefazEx.getMotivo()).isEqualTo("Rejeição: Duplicidade de NFe");
                });
    }

    @Test
    void shouldReturnTrueWhenServiceStatusIsOnline() throws Exception {
        String mockEncryptedPassword = "pass";
        when(encryptionPortMock.decrypt(mockEncryptedPassword)).thenReturn("mockpass");

        String mockResponse = "<cStat>107</cStat>";
        when(mtlsTemplateMock.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok(mockResponse));

        boolean isOnline = sefazClient.checkServiceStatus("SP", true, mockCertificateBytes, mockEncryptedPassword);

        assertThat(isOnline).isTrue();
    }

    @Test
    void shouldReturnFalseWhenServiceStatusCallTimeouts() throws Exception {
        String mockEncryptedPassword = "pass";

        SefazSoapClient timeoutClient = new SefazSoapClient(encryptionPortMock, endpointsRegistryMock) {
            @Override
            RestTemplate buildMtlsRestTemplate(byte[] p12Bytes, String encryptedPassword) throws Exception {
                throw new RuntimeException("SSL Handshake Timeout");
            }
        };

        boolean isOnline = timeoutClient.checkServiceStatus("MG", true, mockCertificateBytes, mockEncryptedPassword);

        assertThat(isOnline).isFalse();
    }
}
