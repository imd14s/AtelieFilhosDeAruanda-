package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.application.dto.fiscal.CertificateInfoResponse;
import com.atelie.ecommerce.application.service.config.SystemConfigService;
import com.atelie.ecommerce.infrastructure.security.EncryptionUtility;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Enumeration;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateService {

    public static final String CONFIG_CERT_BYTES = "FISCAL_CERT_BASE64_ENCRYPTED";
    public static final String CONFIG_CERT_PASSWORD = "FISCAL_CERT_PASSWORD_ENCRYPTED";

    private final SystemConfigService configService;
    private final EncryptionUtility encryptionUtility;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
            .withZone(ZoneId.systemDefault());

    public CertificateInfoResponse upload(byte[] pfxBytes, String password) throws Exception {
        // 1. Validar integridade do certificado fazendo parse
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(new ByteArrayInputStream(pfxBytes), password.toCharArray());

        // 2. Extrair metadados do primeiro certificado encontrado
        CertificateInfoResponse info = extractMetadata(keyStore);

        // 3. Cifrar dados
        String encryptedBytes = Base64.getEncoder().encodeToString(encryptionUtility.encrypt(pfxBytes));
        String encryptedPassword = encryptionUtility.encrypt(password);

        // 4. Salvar no banco via ConfigService
        configService.upsert(CONFIG_CERT_BYTES, encryptedBytes);
        configService.upsert(CONFIG_CERT_PASSWORD, encryptedPassword);

        log.info("Novo certificado digital carregado e cifrado com sucesso para: {}", info.getSubjectName());
        return info;
    }

    public CertificateInfoResponse getMetadata() {
        return configService.findByKey(CONFIG_CERT_BYTES)
                .map(config -> {
                    try {
                        byte[] encryptedBytes = Base64.getDecoder().decode(config.value());
                        byte[] pfxBytes = encryptionUtility.decrypt(encryptedBytes);

                        String encryptedPwd = configService.findByKey(CONFIG_CERT_PASSWORD)
                                .orElseThrow(() -> new RuntimeException("Senha do certificado não encontrada."))
                                .value();
                        String password = encryptionUtility.decrypt(encryptedPwd);

                        KeyStore keyStore = KeyStore.getInstance("PKCS12");
                        keyStore.load(new ByteArrayInputStream(pfxBytes), password.toCharArray());

                        return extractMetadata(keyStore);
                    } catch (Exception e) {
                        log.error("Falha ao recuperar metadados do certificado", e);
                        return null;
                    }
                }).orElse(null);
    }

    public void revoke() {
        configService.delete(CONFIG_CERT_BYTES);
        configService.delete(CONFIG_CERT_PASSWORD);
        log.warn("Certificado digital revogado pelo usuário.");
    }

    private CertificateInfoResponse extractMetadata(KeyStore keyStore) throws Exception {
        Enumeration<String> aliases = keyStore.aliases();
        while (aliases.hasMoreElements()) {
            String alias = aliases.nextElement();
            if (keyStore.isKeyEntry(alias)) {
                X509Certificate cert = (X509Certificate) keyStore.getCertificate(alias);

                return CertificateInfoResponse.builder()
                        .subjectName(cert.getSubjectX500Principal().getName())
                        .issuerName(cert.getIssuerX500Principal().getName())
                        .expirationDate(DATE_FORMATTER.format(cert.getNotAfter().toInstant()))
                        .isValid(cert.getNotAfter().after(new java.util.Date()))
                        .build();
            }
        }
        throw new RuntimeException("Nenhuma chave privada encontrada no certificado PFX.");
    }
}
