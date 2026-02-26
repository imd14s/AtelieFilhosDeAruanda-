package com.atelie.ecommerce.domain.fiscal.nfe.security;

/**
 * Porta do Domínio para atuar na assinatura de documentos fiscais.
 * Abstrai a dependência de algoritmos específicos W3C para a regra de negócio.
 */
public interface NfeSignaturePort {

    /**
     * Processa o XML puro de uma NF-e, anexa o bloco oficial de assinatura com base
     * no Certificado,
     * e devolve a String XML finalizada pronta para envio à SEFAZ.
     *
     * @param xmlContent        Conteúdo do XML da NF-e (Apenas as tags de infNFe
     *                          preenchidas).
     * @param certificateBytes  O array de bytes binário do arquivo PKCS#12
     *                          (Certificado A1).
     * @param encryptedPassword Senha encriptada armazenada de forma segura na base
     *                          dados.
     * @return O XML envelopado e validado logicamente com a tag Signature.
     */
    String sign(String xmlContent, byte[] certificateBytes, String encryptedPassword) throws NfeSignatureException;

}
