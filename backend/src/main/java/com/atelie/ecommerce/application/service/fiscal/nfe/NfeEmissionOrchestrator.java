package com.atelie.ecommerce.application.service.fiscal.nfe;

import com.atelie.ecommerce.domain.fiscal.nfe.NfeCredentials;
import com.atelie.ecommerce.domain.fiscal.nfe.NfeEmissionStrategy;
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
import org.springframework.stereotype.Service;

import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class NfeEmissionOrchestrator implements NfeEmissionStrategy {

    private static final Logger logger = Logger.getLogger(NfeEmissionOrchestrator.class.getName());

    private final NfeDataMapperPort dataMapper;
    private final NfeXmlValidatorPort xmlValidator;
    private final NfeSignaturePort signaturePort;
    private final SefazIntegrationPort sefazIntegrationPort;

    public NfeEmissionOrchestrator(
            NfeDataMapperPort dataMapper,
            NfeXmlValidatorPort xmlValidator,
            NfeSignaturePort signaturePort,
            SefazIntegrationPort sefazIntegrationPort) {
        this.dataMapper = dataMapper;
        this.xmlValidator = xmlValidator;
        this.signaturePort = signaturePort;
        this.sefazIntegrationPort = sefazIntegrationPort;
    }

    @Override
    public String emit(OrderEntity order, NfeCredentials credentials) {
        try {
            logger.info("Iniciando orquestração de emissão NF-e para Pedido Externo: " + order.getExternalId());

            // 1. Data Mapping to raw XML
            String rawXml = dataMapper.generateNfeXml(order);

            // 2. Off-line validation against XSD
            if (rawXml == null || rawXml.isBlank()) {
                throw new NfeIssuanceException("O Mapeamento Fiscal gerou um XML vazio ou nulo.");
            }
            xmlValidator.validate(rawXml);
            logger.fine("Validação XSD local estrita finalizada com sucesso.");

            // 3. W3C XMLDSig Signing via Port
            String signedXml = signaturePort.sign(
                    rawXml,
                    credentials.getCertificateBytes(),
                    credentials.getEncryptedPassword());
            logger.fine("Assinatura XMLDSig injetada com sucesso em memória.");

            // 4. MTLS Transmission
            // Hardcoding UF "SP" for the initial scope or parsing from Order shipping
            // state.
            String ufDest = order.getShippingState() != null ? order.getShippingState() : "SP";

            logger.info("Acionando transmissão SEFAZ-SOAP. MTLS Handshake...");
            String sefazReceiptXml = sefazIntegrationPort.authorizeNfe(
                    signedXml,
                    ufDest,
                    credentials.isProduction(),
                    credentials.getCertificateBytes(),
                    credentials.getEncryptedPassword());

            logger.info(
                    "Emissão Finalizada: Status [Lote processado] deferido pela SEFAZ para " + order.getExternalId());

            order.setNfeReceipt(sefazReceiptXml);
            // Optionally, the caller Service should process Order Status transition to
            // NF_EMITIDA

            return sefazReceiptXml;

        } catch (NfeValidationException e) {
            logger.log(Level.SEVERE, "Orquestração Falhou: O XML gerado feriu o Schema Fiscal 4.00.", e);
            throw new NfeIssuanceException("Erro na validação do layout da NFe.", e);
        } catch (NfeSignatureException e) {
            logger.log(Level.SEVERE, "Orquestração Falhou: Anomalia criptográfica ou formatação P12.", e);
            throw new NfeIssuanceException("Falha na Assinatura Digital.", e);
        } catch (SefazRejectionException e) {
            logger.log(Level.SEVERE, "Orquestração Rejeitada: A SEFAZ interceptou e rejeitou a NFe estruturalmente.");
            logger.log(Level.SEVERE, "Sefaz cStat: " + e.getCStat() + " - " + e.getMotivo());
            throw new NfeIssuanceException("Rejeição Fiscal SEFAZ: " + e.getMotivo(), e.getCStat(), e.getMotivo(), e);
        } catch (SefazCommunicationException e) {
            logger.log(Level.SEVERE, "Transmissão Interrompida: Queda na conexão ou Timeout no Sefaz-SOAP.", e);
            throw new NfeIssuanceException("A Sefaz Estadual não respondeu a contento.", e);
        } catch (Exception e) {
            throw new NfeIssuanceException("Anomalia fatal e não identificada no ciclo Nfe", e);
        }
    }
}
