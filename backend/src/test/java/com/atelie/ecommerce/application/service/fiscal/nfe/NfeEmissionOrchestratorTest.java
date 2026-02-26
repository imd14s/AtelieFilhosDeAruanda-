package com.atelie.ecommerce.application.service.fiscal.nfe;

import com.atelie.ecommerce.domain.fiscal.nfe.NfeCredentials;
import com.atelie.ecommerce.domain.fiscal.nfe.NfeIssuanceException;
import com.atelie.ecommerce.domain.fiscal.nfe.NfeDataMapperPort;
import com.atelie.ecommerce.domain.fiscal.nfe.NfeValidationException;
import com.atelie.ecommerce.domain.fiscal.nfe.NfeXmlValidatorPort;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazCommunicationException;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazIntegrationPort;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazRejectionException;
import com.atelie.ecommerce.domain.fiscal.nfe.security.NfeSignatureException;
import com.atelie.ecommerce.domain.fiscal.nfe.security.NfeSignaturePort;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class NfeEmissionOrchestratorTest {

        private NfeDataMapperPort dataMapperMock;
        private NfeXmlValidatorPort xmlValidatorMock;
        private NfeSignaturePort signaturePortMock;
        private SefazIntegrationPort sefazIntegrationPortMock;
        private NfeEmissionOrchestrator orchestrator;

        private OrderEntity mockOrder;
        private NfeCredentials credentials;

        @BeforeEach
        void setUp() {
                dataMapperMock = mock(NfeDataMapperPort.class);
                xmlValidatorMock = mock(NfeXmlValidatorPort.class);
                signaturePortMock = mock(NfeSignaturePort.class);
                sefazIntegrationPortMock = mock(SefazIntegrationPort.class);

                orchestrator = new NfeEmissionOrchestrator(
                                dataMapperMock,
                                xmlValidatorMock,
                                signaturePortMock,
                                sefazIntegrationPortMock);

                mockOrder = new OrderEntity();
                mockOrder.setId(UUID.randomUUID());
                mockOrder.setExternalId("EXT-12345");
                mockOrder.setShippingState("SP");

                credentials = new NfeCredentials(new byte[] { 1, 2, 3 }, "encrypted123", true);
        }

        @Test
        void shouldOrchestrateIssuanceSuccessfullyWhenAllStepsPass() throws Exception {
                String rawXml = "<nfe>RAW</nfe>";
                String signedXml = "<nfe>SIGNED</nfe>";
                String sefazReceipt = "<retEnviNFe><cStat>104</cStat></retEnviNFe>";

                when(dataMapperMock.generateNfeXml(mockOrder)).thenReturn(rawXml);
                doNothing().when(xmlValidatorMock).validate(rawXml);
                when(signaturePortMock.sign(rawXml, credentials.getCertificateBytes(),
                                credentials.getEncryptedPassword()))
                                .thenReturn(signedXml);
                when(sefazIntegrationPortMock.authorizeNfe(
                                eq(signedXml),
                                eq("SP"),
                                eq(credentials.isProduction()),
                                any(byte[].class),
                                anyString())).thenReturn(sefazReceipt);

                String result = orchestrator.emit(mockOrder, credentials);

                assertThat(result).isEqualTo(sefazReceipt);
                verify(xmlValidatorMock, times(1)).validate(rawXml);
                verify(signaturePortMock, times(1)).sign(rawXml, credentials.getCertificateBytes(),
                                credentials.getEncryptedPassword());
        }

    @Test
    void shouldThrowIssuanceExceptionWhenDataMapperFails() throws Exception {
        when(dataMapperMock.generateNfeXml(mockOrder)).thenThrow(new RuntimeException("Incomplete Order"));

        assertThatThrownBy(() -> orchestrator.emit(mockOrder, credentials))
                .isInstanceOf(NfeIssuanceException.class)
                .hasMessageContaining("Anomalia fatal e não identificada no ciclo Nfe");

        verifyNoInteractions(xmlValidatorMock, signaturePortMock, sefazIntegrationPortMock);
    }

        @Test
        void shouldThrowIssuanceExceptionWhenXmlIsInvalid() throws Exception {
                String rawXml = "<nfe>RAW</nfe>";
                when(dataMapperMock.generateNfeXml(mockOrder)).thenReturn(rawXml);
                doThrow(new NfeValidationException("Schema Rejeitado")).when(xmlValidatorMock).validate(rawXml);

                assertThatThrownBy(() -> orchestrator.emit(mockOrder, credentials))
                                .isInstanceOf(NfeIssuanceException.class)
                                .hasMessageContaining("Erro na validação do layout");

                verifyNoInteractions(signaturePortMock, sefazIntegrationPortMock);
        }

        @Test
        void shouldThrowIssuanceExceptionWhenSignatureFails() throws Exception {
                String rawXml = "<nfe>RAW</nfe>";
                when(dataMapperMock.generateNfeXml(mockOrder)).thenReturn(rawXml);
                when(signaturePortMock.sign(anyString(), any(byte[].class), anyString()))
                                .thenThrow(new NfeSignatureException("Senha Inválida", null));

                assertThatThrownBy(() -> orchestrator.emit(mockOrder, credentials))
                                .isInstanceOf(NfeIssuanceException.class)
                                .hasMessageContaining("Falha na Assinatura Digital");

                verifyNoInteractions(sefazIntegrationPortMock);
        }

        @Test
        void shouldThrowIssuanceExceptionWithCstatWhenSefazRejectsStructuralRules() throws Exception {
                String rawXml = "<nfe>RAW</nfe>";
                String signedXml = "<nfe>SIGNED</nfe>";

                when(dataMapperMock.generateNfeXml(mockOrder)).thenReturn(rawXml);
                when(signaturePortMock.sign(anyString(), any(byte[].class), anyString())).thenReturn(signedXml);

                when(sefazIntegrationPortMock.authorizeNfe(anyString(), anyString(), anyBoolean(), any(byte[].class),
                                anyString()))
                                .thenThrow(new SefazRejectionException("SEFAZ Negou a Transação", "539",
                                                "Rejeição: Duplicidade de NFe"));

                assertThatThrownBy(() -> orchestrator.emit(mockOrder, credentials))
                                .isInstanceOf(NfeIssuanceException.class)
                                .hasMessageContaining("Rejeição Fiscal SEFAZ: Rejeição: Duplicidade de NFe")
                                .satisfies(e -> {
                                        NfeIssuanceException ex = (NfeIssuanceException) e;
                                        assertThat(ex.getCStat()).isEqualTo("539");
                                        assertThat(ex.getReason()).isEqualTo("Rejeição: Duplicidade de NFe");
                                });
        }

        @Test
        void shouldThrowIssuanceExceptionWhenSefazTimeouts() throws Exception {
                String rawXml = "<nfe>RAW</nfe>";
                String signedXml = "<nfe>SIGNED</nfe>";

                when(dataMapperMock.generateNfeXml(mockOrder)).thenReturn(rawXml);
                when(signaturePortMock.sign(anyString(), any(byte[].class), anyString())).thenReturn(signedXml);

                when(sefazIntegrationPortMock.authorizeNfe(anyString(), anyString(), anyBoolean(), any(byte[].class),
                                anyString()))
                                .thenThrow(new SefazCommunicationException("SocketTimeoutException", null));

                assertThatThrownBy(() -> orchestrator.emit(mockOrder, credentials))
                                .isInstanceOf(NfeIssuanceException.class)
                                .hasMessageContaining("A Sefaz Estadual não respondeu a contento");
        }
}
