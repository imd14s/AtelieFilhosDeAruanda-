package com.atelie.ecommerce.infrastructure.security;

import com.atelie.ecommerce.domain.common.exception.CryptoIntegrityViolationException;
import com.atelie.ecommerce.domain.common.security.SymmetricEncryptionPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Arrays;
import java.util.Base64;

@Component
public class EncryptionUtility implements InitializingBean, SymmetricEncryptionPort {

    private static final Logger logger = LoggerFactory.getLogger(EncryptionUtility.class);

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128; // em bits
    private static final int ITERATION_COUNT = 65536;
    private static final int KEY_LENGTH = 256; // em bits

    // Header for versioning (e.g., v1 e v2)
    private static final byte[] VERSION_HEADER_V1 = new byte[] { 'v', '1' };
    private static final byte[] VERSION_HEADER_V2 = new byte[] { 'v', '2' };
    private static final int HEADER_LENGTH = 2;

    private final char[] v2Password;
    private final char[] v2Salt;
    private final char[] v1LegacyPassword;
    private final char[] v1LegacySalt;

    private SecretKey secretKeyV2;
    private SecretKey secretKeyV1;

    public EncryptionUtility(
            @Value("${INTEGRATION_ENCRYPTION_KEY_V2}") char[] v2Password,
            @Value("${INTEGRATION_ENCRYPTION_SALT_V2}") char[] v2Salt,
            @Value("${INTEGRATION_ENCRYPTION_KEY:#{null}}") char[] v1LegacyPassword,
            @Value("${INTEGRATION_ENCRYPTION_SALT:#{null}}") char[] v1LegacySalt) {

        this.v2Password = v2Password;
        this.v2Salt = v2Salt;
        this.v1LegacyPassword = v1LegacyPassword;
        this.v1LegacySalt = v1LegacySalt;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        // Inicialização V2 (Primary)
        validateInput(v2Password, v2Salt, "V2");
        this.secretKeyV2 = deriveKey(v2Password, v2Salt);
        Arrays.fill(v2Password, '\0');
        Arrays.fill(v2Salt, '\0');

        // Inicialização V1 (Fallback p/ Rotação)
        if (v1LegacyPassword != null && v1LegacySalt != null && v1LegacyPassword.length > 0) {
            validateInput(v1LegacyPassword, v1LegacySalt, "V1 / Legado");
            this.secretKeyV1 = deriveKey(v1LegacyPassword, v1LegacySalt);
            Arrays.fill(v1LegacyPassword, '\0');
            Arrays.fill(v1LegacySalt, '\0');
        } else {
            logger.warn("Chaves V1 não configuradas. Os dados legado cifrados com v1 não poderão ser decifrados.");
        }
    }

    private void validateInput(char[] pwd, char[] salt, String version) {
        if (pwd == null || pwd.length == 0) {
            throw new IllegalArgumentException("CRÍTICO: VARIÁVEL DE CHAVE DA VERSÃO " + version + " NÃO DEFINIDA");
        }
        if (salt == null || salt.length == 0) {
            throw new IllegalArgumentException("CRÍTICO: VARIÁVEL DE SALT DA VERSÃO " + version + " NÃO DEFINIDA");
        }
        if (pwd.length < 16) {
            throw new IllegalArgumentException("CRÍTICO: A chave da versão " + version
                    + " deve ter no mínimo 16 caracteres para garantir alta entropia.");
        }
        if (salt.length < 16) {
            throw new IllegalArgumentException("CRÍTICO: O salt da versão " + version
                    + " deve ter no mínimo 16 caracteres para garantir alta entropia.");
        }
    }

    private SecretKey deriveKey(char[] pwd, char[] saltRaw) {
        try {
            byte[] saltBytes = new byte[saltRaw.length];
            for (int i = 0; i < saltRaw.length; i++) {
                saltBytes[i] = (byte) saltRaw[i];
            }

            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            KeySpec spec = new PBEKeySpec(pwd, saltBytes, ITERATION_COUNT, KEY_LENGTH);
            SecretKey tmp = factory.generateSecret(spec);
            SecretKeySpec secretKey = new SecretKeySpec(tmp.getEncoded(), "AES");

            // Forçar zeroing do byte array de salt local logo após a criação
            Arrays.fill(saltBytes, (byte) 0);

            return secretKey;
        } catch (Exception e) {
            throw new IllegalStateException("CRÍTICO: Falha ao inicializar o motor criptográfico AES-256 GCM", e);
        }
    }

    @Override
    public byte[] encrypt(byte[] raw) {
        if (raw == null)
            return null;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeyV2, parameterSpec);

            byte[] cipherText = cipher.doFinal(raw);

            ByteBuffer byteBuffer = ByteBuffer.allocate(HEADER_LENGTH + iv.length + cipherText.length);
            byteBuffer.put(VERSION_HEADER_V2);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return byteBuffer.array();
        } catch (Exception e) {
            logger.error("Erro estrutural durante o processo de encriptação", e);
            throw new RuntimeException("Falha ao cifrar dados simétricos", e);
        }
    }

    @Override
    public byte[] decrypt(byte[] encrypted) {
        if (encrypted == null)
            return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);

            if (encrypted.length < HEADER_LENGTH + GCM_IV_LENGTH) {
                throw new IllegalArgumentException(
                        "Payload criptografado malformado (menor que o tamanho do cabeçalho + IV)");
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(encrypted);

            byte[] header = new byte[HEADER_LENGTH];
            byteBuffer.get(header);

            SecretKey activeSecretKey;
            if (Arrays.equals(header, VERSION_HEADER_V2)) {
                activeSecretKey = secretKeyV2;
            } else if (Arrays.equals(header, VERSION_HEADER_V1)) {
                if (secretKeyV1 == null) {
                    throw new CryptoIntegrityViolationException(
                            "Chave V1 ausente e payload legado não pode ser decifrado.");
                }
                activeSecretKey = secretKeyV1;
            } else {
                throw new IllegalArgumentException("Versão de criptografia não suportada ou cabeçalho inválido.");
            }

            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, activeSecretKey, parameterSpec);

            return cipher.doFinal(cipherText);

        } catch (AEADBadTagException e) {
            logger.error("VIOLAÇÃO DE INTEGRIDADE: GCM Auth Tag inválida! Tentativa de adulteração detectada.");
            throw new CryptoIntegrityViolationException("Crash de Integridade Criptográfica. Assinatura inválida.", e);
        } catch (CryptoIntegrityViolationException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Erro genérico durante decriptação", e);
            throw new RuntimeException("Falha ao decifrar dados da aplicação", e);
        }
    }

    @Override
    public String encrypt(String text) {
        if (text == null)
            return null;
        byte[] encryptedBytes = encrypt(text.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    @Override
    public String decrypt(String encryptedText) {
        if (encryptedText == null)
            return null;
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);
            byte[] decryptedBytes = decrypt(decodedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (CryptoIntegrityViolationException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Falha ao processar a decodificação da string criptografada.", e);
            throw new RuntimeException("Erro ao parsear dados criptografados", e);
        }
    }

    @Override
    public void encryptStream(InputStream in, OutputStream out) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeyV2, parameterSpec);

            out.write(VERSION_HEADER_V2);
            out.write(iv);

            try (CipherOutputStream cipherOut = new CipherOutputStream(out, cipher)) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = in.read(buffer)) != -1) {
                    cipherOut.write(buffer, 0, count);
                }
            }
        } catch (Exception e) {
            logger.error("Erro estrutural durante encriptação (stream)", e);
            throw new RuntimeException("Falha ao cifrar stream de dados", e);
        }
    }

    @Override
    public void decryptStream(InputStream in, OutputStream out) {
        try {
            byte[] header = new byte[HEADER_LENGTH];
            int headerBytesRead = in.read(header);
            if (headerBytesRead != HEADER_LENGTH) {
                throw new IllegalArgumentException("Fluxo criptografado malformado (falha ao ler header)");
            }

            SecretKey activeSecretKey;
            if (Arrays.equals(header, VERSION_HEADER_V2)) {
                activeSecretKey = secretKeyV2;
            } else if (Arrays.equals(header, VERSION_HEADER_V1)) {
                if (secretKeyV1 == null) {
                    throw new CryptoIntegrityViolationException(
                            "Chave V1 ausente e fluxo legado não pode ser decifrado.");
                }
                activeSecretKey = secretKeyV1;
            } else {
                throw new IllegalArgumentException("Versão de criptografia não suportada.");
            }

            byte[] iv = new byte[GCM_IV_LENGTH];
            int ivBytesRead = in.read(iv);
            if (ivBytesRead != GCM_IV_LENGTH) {
                throw new IllegalArgumentException("Fluxo criptografado malformado (falha ao ler IV)");
            }

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, activeSecretKey, parameterSpec);

            try (CipherInputStream cipherIn = new CipherInputStream(in, cipher)) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = cipherIn.read(buffer)) != -1) {
                    out.write(buffer, 0, count);
                }
            } catch (Exception innerE) {
                if (innerE.getCause() instanceof AEADBadTagException) {
                    logger.error("VIOLAÇÃO DE INTEGRIDADE: GCM Auth Tag inválida no stream!");
                    throw new CryptoIntegrityViolationException("Crash de Integridade Criptográfica no Stream.",
                            innerE);
                }
                throw innerE;
            }

        } catch (CryptoIntegrityViolationException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erro durante o processo de decriptação (stream)", e);
            throw new RuntimeException("Falha ao decifrar stream", e);
        }
    }
}
