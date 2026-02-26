package com.atelie.ecommerce.domain.fiscal.nfe.integration;

/**
 * Porta do Domínio (Outbound) para comunicação direta com os WebServices da
 * Sefaz Autorizadora.
 * Encapsula a necessidade do SOAP, MTLS e Envelopamento.
 */
public interface SefazIntegrationPort {

    /**
     * Transmite a NF-e já finalizada e assinada para autorização.
     * 
     * @param signedXml         XML Modelo 55 pronto e assinado digitalmente
     *                          (XMLDSig).
     * @param targetUf          UF Destino (ex: "SP", "RJ") para roteamento no
     *                          EndpointsRegistry.
     * @param isProduction      True para Ambiente de Produção (tpAmb=1), False para
     *                          Homologação (tpAmb=2).
     * @param certificateBytes  Byte array do PKCS#12 (A1).
     * @param encryptedPassword Senha criptografada do certificado.
     * @return O Protocolo de Autorização caso SUCESSO (cStat 100/104).
     * @throws SefazCommunicationException Falhas de rede, Timeout.
     * @throws SefazRejectionException     Rejeição por Regra de Negócio com cStat
     *                                     claro.
     */
    String authorizeNfe(String signedXml, String targetUf, boolean isProduction, byte[] certificateBytes,
            String encryptedPassword)
            throws SefazCommunicationException, SefazRejectionException;

    /**
     * Consulta se os serviços web de uma Sefaz Autorizadora estão online.
     * Ideal para painéis de status do Ateliê.
     */
    boolean checkServiceStatus(String targetUf, boolean isProduction, byte[] certificateBytes,
            String encryptedPassword);

    /**
     * Tenta aprovar o Cancelamento de uma NF-e já autorizada previamente.
     */
    String cancelNfe(String chaveAcesso, String justification, String targetUf, boolean isProduction,
            byte[] certificateBytes, String encryptedPassword)
            throws SefazCommunicationException, SefazRejectionException;

}
