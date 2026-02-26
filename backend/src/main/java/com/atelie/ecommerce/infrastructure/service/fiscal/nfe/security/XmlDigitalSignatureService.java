package com.atelie.ecommerce.infrastructure.service.fiscal.nfe.security;

import com.atelie.ecommerce.domain.common.security.SymmetricEncryptionPort;
import com.atelie.ecommerce.domain.fiscal.nfe.security.NfeSignatureException;
import com.atelie.ecommerce.domain.fiscal.nfe.security.NfeSignaturePort;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.crypto.dsig.*;
import javax.xml.crypto.dsig.dom.DOMSignContext;
import javax.xml.crypto.dsig.keyinfo.KeyInfo;
import javax.xml.crypto.dsig.keyinfo.KeyInfoFactory;
import javax.xml.crypto.dsig.keyinfo.X509Data;
import javax.xml.crypto.dsig.spec.C14NMethodParameterSpec;
import javax.xml.crypto.dsig.spec.TransformParameterSpec;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class XmlDigitalSignatureService implements NfeSignaturePort {

    private final SymmetricEncryptionPort encryptionPort;
    private static final String NFE_REFERENCE_URI_ATTRIBUTE = "Id";
    private static final String NFE_TAG_TO_SIGN = "infNFe";

    public XmlDigitalSignatureService(SymmetricEncryptionPort encryptionPort) {
        this.encryptionPort = encryptionPort;
    }

    @Override
    public String sign(String xmlContent, byte[] certificateBytes, String encryptedPassword)
            throws NfeSignatureException {
        if (xmlContent == null || xmlContent.isBlank()) {
            throw new NfeSignatureException("Conteúdo XML vazio ou nulo não pode ser assinado.");
        }
        if (certificateBytes == null || certificateBytes.length == 0) {
            throw new NfeSignatureException("Os bytes do certificado PKCS#12 são obrigatórios para a assinatura.");
        }

        try {
            // 1. Decifra a senha do certificado com segurança
            String rawPassword = encryptionPort.decrypt(encryptedPassword);

            // 2. Carrega a KeyStore (PKCS#12) na memória a partir dos bytes
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            try (ByteArrayInputStream bis = new ByteArrayInputStream(certificateBytes)) {
                keyStore.load(bis, rawPassword.toCharArray());
            }

            // Acha o alias do certificado principal
            String alias = keyStore.aliases().nextElement();
            PrivateKey privateKey = (PrivateKey) keyStore.getKey(alias, rawPassword.toCharArray());
            X509Certificate cert = (X509Certificate) keyStore.getCertificate(alias);

            // 3. Verifica se a chave privada e o certificado são válidos
            if (privateKey == null || cert == null) {
                throw new NfeSignatureException("Certificado corrompido ou alias inacessível dentro do PKCS#12.");
            }
            cert.checkValidity(); // Estoura exceção se expirado

            // 4. Converte a String XML para um Documento W3C Modificável
            Document document = parseXmlStringToDocument(xmlContent);
            document.setXmlStandalone(false);

            // 5. Instancia a Fábrica de Assinaturas XML e os preparos do W3C
            XMLSignatureFactory signatureFactory = XMLSignatureFactory.getInstance("DOM");

            // Método de Canonização Exclusiva e Digest RSA+SHA1 estritamente exigidos pelo
            // MOC
            List<Transform> transforms = new ArrayList<>();
            transforms.add(signatureFactory.newTransform(Transform.ENVELOPED, (TransformParameterSpec) null));
            transforms.add(signatureFactory.newTransform(CanonicalizationMethod.INCLUSIVE_WITH_COMMENTS,
                    (TransformParameterSpec) null));

            NodeList elements = document.getElementsByTagName(NFE_TAG_TO_SIGN);
            if (elements.getLength() == 0) {
                throw new NfeSignatureException("Tag <" + NFE_TAG_TO_SIGN + "> não localizada no layout do XML.");
            }
            Element targetElement = (Element) elements.item(0);
            String idToSign = targetElement.getAttribute(NFE_REFERENCE_URI_ATTRIBUTE);
            targetElement.setIdAttribute(NFE_REFERENCE_URI_ATTRIBUTE, true);

            // Aponta a referência para a URI interna (Ex: URI="#NFe352...")
            Reference reference = signatureFactory.newReference(
                    "#" + idToSign,
                    signatureFactory.newDigestMethod(DigestMethod.SHA1, null),
                    transforms,
                    null,
                    null);

            SignedInfo signedInfo = signatureFactory.newSignedInfo(
                    signatureFactory.newCanonicalizationMethod(CanonicalizationMethod.INCLUSIVE_WITH_COMMENTS,
                            (C14NMethodParameterSpec) null),
                    signatureFactory.newSignatureMethod(SignatureMethod.RSA_SHA1, null),
                    Collections.singletonList(reference));

            // Empacota as informações públicas do Certificado X509 (Identificação da NFe)
            KeyInfoFactory keyInfoFactory = signatureFactory.getKeyInfoFactory();
            X509Data x509Data = keyInfoFactory.newX509Data(Collections.singletonList(cert));
            KeyInfo keyInfo = keyInfoFactory.newKeyInfo(Collections.singletonList(x509Data));

            // Contexto DOM indicando *onde* inserir a tag <Signature>. No layout da NFe,
            // ela entra como filha da tag Raiz <NFe> logo após <infNFe>
            DOMSignContext dsc = new DOMSignContext(privateKey, document.getDocumentElement());

            // 6. Geração Execução / Assinatura
            XMLSignature signature = signatureFactory.newXMLSignature(signedInfo, keyInfo);
            signature.sign(dsc);

            // 7. Retorna o XML novamente Transcodificado como String (mantendo encoding e
            // sem quebras indesejadas que invalidariam o Hash)
            return transformDocumentToString(document);

        } catch (Exception e) {
            throw new NfeSignatureException(
                    "Falha irrecuperável na extração, digestão ou aplicação do XMLDSig. Detalhes: " + e.getMessage(),
                    e);
        }
    }

    private Document parseXmlStringToDocument(String xmlString) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new ByteArrayInputStream(xmlString.getBytes("UTF-8")));
    }

    private String transformDocumentToString(Document document) throws Exception {
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer trans = tf.newTransformer();
        trans.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
        trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        trans.setOutputProperty(OutputKeys.INDENT, "no");

        StringWriter writer = new StringWriter();
        trans.transform(new DOMSource(document), new StreamResult(writer));
        return writer.toString();
    }
}
