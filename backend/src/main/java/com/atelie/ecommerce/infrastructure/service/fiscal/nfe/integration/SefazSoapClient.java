package com.atelie.ecommerce.infrastructure.service.fiscal.nfe.integration;

import com.atelie.ecommerce.domain.common.security.SymmetricEncryptionPort;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazCommunicationException;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazIntegrationPort;
import com.atelie.ecommerce.domain.fiscal.nfe.integration.SefazRejectionException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.ssl.SSLContexts;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import javax.net.ssl.SSLContext;
import java.io.ByteArrayInputStream;
import java.security.KeyStore;
import org.w3c.dom.Document;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

@Service
public class SefazSoapClient implements SefazIntegrationPort {

    private final SymmetricEncryptionPort encryptionPort;
    private final SefazEndpointsRegistry endpointsRegistry;

    public SefazSoapClient(SymmetricEncryptionPort encryptionPort, SefazEndpointsRegistry endpointsRegistry) {
        this.encryptionPort = encryptionPort;
        this.endpointsRegistry = endpointsRegistry;
    }

    @Override
    public String authorizeNfe(String signedXml, String targetUf, boolean isProduction, byte[] certificateBytes,
            String encryptedPassword) throws SefazCommunicationException, SefazRejectionException {
        // Envelopar em SOAP 1.2 o XML assinado da NF-e (Apenas o NFe. A SEFAZ consome
        // enveLote ou infNFe dependendo da versão, usando o lote genérico 4.00)
        String soapBody = "<soap12:Envelope xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">" +
                "<soap12:Header><nfeCabecMsg xmlns=\"http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4\"><cUF>"
                + getUfCode(targetUf) + "</cUF><versaoDados>4.00</versaoDados></nfeCabecMsg></soap12:Header>" +
                "<soap12:Body><nfeDadosMsg xmlns=\"http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4\">" +
                "<enviNFe versao=\"4.00\" xmlns=\"http://www.portalfiscal.inf.br/nfe\"><idLote>1</idLote><indSinc>1</indSinc>"
                +
                signedXml + "</enviNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>";

        String url = endpointsRegistry.getNfeAutorizacaoUrl(targetUf, isProduction);

        String response = performSoapCall(url, soapBody, certificateBytes, encryptedPassword,
                "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote");

        return parseSefazReturn(response);
    }

    @Override
    public boolean checkServiceStatus(String targetUf, boolean isProduction, byte[] certificateBytes,
            String encryptedPassword) {
        try {
            String soapBody = "<soap12:Envelope xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">" +
                    "<soap12:Header><nfeCabecMsg xmlns=\"http://www.portalfiscal.inf.br/nfe/wsdl/NfeStatusServico4\"><cUF>"
                    + getUfCode(targetUf) + "</cUF><versaoDados>4.00</versaoDados></nfeCabecMsg></soap12:Header>" +
                    "<soap12:Body><nfeDadosMsg xmlns=\"http://www.portalfiscal.inf.br/nfe/wsdl/NfeStatusServico4\">" +
                    "<consStatServ versao=\"4.00\" xmlns=\"http://www.portalfiscal.inf.br/nfe\"><tpAmb>"
                    + (isProduction ? "1" : "2") + "</tpAmb><cUF>" + getUfCode(targetUf)
                    + "</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>";

            String url = endpointsRegistry.getNfeStatusUrl(targetUf, isProduction);
            String response = performSoapCall(url, soapBody, certificateBytes, encryptedPassword,
                    "http://www.portalfiscal.inf.br/nfe/wsdl/NfeStatusServico4/nfeStatusServicoNF");

            // Sucesso genérico 107
            return response.contains("<cStat>107</cStat>");
        } catch (Exception e) {
            return false; // Timeouts ou falhas MTLS marcam offline
        }
    }

    @Override
    public String cancelNfe(String chaveAcesso, String justification, String targetUf, boolean isProduction,
            byte[] certificateBytes, String encryptedPassword)
            throws SefazCommunicationException, SefazRejectionException {
        // Fluxo de evento de cancelamento genérico apenas instanciado por demonstração
        // estrutural arquitetural
        throw new UnsupportedOperationException("Not implemented yet for full SEFAZ cancellation layout");
    }

    private String performSoapCall(String url, String soapPayload, byte[] certBytes, String encryptedPassword,
            String soapAction) throws SefazCommunicationException {
        try {
            RestTemplate mtlsTemplate = buildMtlsRestTemplate(certBytes, encryptedPassword);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/soap+xml; charset=utf-8; action=\"" + soapAction + "\"");

            HttpEntity<String> request = new HttpEntity<>(soapPayload, headers);

            ResponseEntity<String> response = mtlsTemplate.exchange(url, HttpMethod.POST, request, String.class);
            return response.getBody();

        } catch (Exception e) {
            throw new SefazCommunicationException("Falha de handshake SSL, Timeout ou Queda na rota da SEFAZ: " + url,
                    e);
        }
    }

    // -- Utilidades Vitais do MTLS --

    RestTemplate buildMtlsRestTemplate(byte[] p12Bytes, String encryptedPassword) throws Exception {
        String rawPass = encryptionPort.decrypt(encryptedPassword);

        // MTLS Trust&Key Store Loader (A1)
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (ByteArrayInputStream bis = new ByteArrayInputStream(p12Bytes)) {
            keyStore.load(bis, rawPass.toCharArray());
        }

        SSLContext sslContext = SSLContexts.custom()
                .loadKeyMaterial(keyStore, rawPass.toCharArray())
                // O Sefaz BR usa Root CA confiavel pelo Java nativamente na maioria das
                // maquinas
                // Aqui podemos adicionar .loadTrustMaterial se quisermos trust managers puros
                .build();

        SSLConnectionSocketFactory sslConFactory = SSLConnectionSocketFactoryBuilder.create()
                .setSslContext(sslContext)
                .build();

        CloseableHttpClient httpClient = HttpClients.custom()
                .setConnectionManager(PoolingHttpClientConnectionManagerBuilder.create()
                        .setSSLSocketFactory(sslConFactory)
                        .build())
                .build();

        HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);
        // Timeouts de resiliência
        requestFactory.setConnectTimeout(8000);

        return new RestTemplate(requestFactory);
    }

    // -- Parser Simples para Regras de Negócio --

    private String parseSefazReturn(String soapResponse) throws SefazRejectionException {
        if (soapResponse == null)
            return null;
        try {
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(new ByteArrayInputStream(soapResponse.getBytes("UTF-8")));

            String cStat = doc.getElementsByTagName("cStat").item(0).getTextContent();
            String xMotivo = doc.getElementsByTagName("xMotivo").item(0).getTextContent();

            if (!cStat.equals("100") && !cStat.equals("104")) { // 100 Autorizado, 104 Processado
                throw new SefazRejectionException("A SEFAZ rejeitou o documento por quebra de regra de negócio.", cStat,
                        xMotivo);
            }

            return soapResponse; // Se 100/104 devolvemos o protocolo para o sistema salvar o recFe

        } catch (SefazRejectionException e) {
            throw e;
        } catch (Exception e) {
            throw new SefazCommunicationException(
                    "O retorno da SEFAZ veio fora do padrão esperado do SOAP ou XML corrupto.", e);
        }
    }

    private String getUfCode(String ufSigla) {
        if (ufSigla != null && ufSigla.equalsIgnoreCase("SP"))
            return "35";
        return "11"; // Fallback apenas para não quebrar
    }
}
