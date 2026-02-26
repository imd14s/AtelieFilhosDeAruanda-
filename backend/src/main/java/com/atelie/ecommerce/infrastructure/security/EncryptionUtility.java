package com.atelie.ecommerce.infrastructure.security;

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
import java.util.Base64;

@Component
public class EncryptionUtility implements InitializingBean {

    private static final Logger logger = LoggerFactory.getLogger(EncryptionUtility.class);

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final int ITERATION_COUNT = 65536;
    private static final int KEY_LENGTH = 256;
    
    // Header for versioning (e.g., v1)
    private static final byte[] VERSION_HEADER = new byte[]{'v', '1'};
    private static final int HEADER_LENGTH = VERSION_HEADER.length;

    private final String password;
    private final String saltStr;
    private SecretKey secretKey;

    public EncryptionUtility(
            @Value("${INTEGRATION_ENCRYPTION_KEY}") String password,
            @Value("${INTEGRATION_ENCRYPTION_SALT}") String saltStr) {
        this.password = password;
        this.saltStr = saltStr;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("CRÍTICO: VARIÁVEL INTEGRATION_ENCRYPTION_KEY NÃO DEFINIDA");
        }
        if (saltStr == null || saltStr.trim().isEmpty()) {
            throw new IllegalArgumentException("CRÍTICO: VARIÁVEL INTEGRATION_ENCRYPTION_SALT NÃO DEFINIDA");
        }
        if (password.length() < 16) {
             throw new IllegalArgumentException("CRÍTICO: A chave INTEGRATION_ENCRYPTION_KEY deve ter no mínimo 16 caracteres para garantir alta entropia.");
        }
        if (saltStr.length() < 16) {
             throw new IllegalArgumentException("CRÍTICO: O salt INTEGRATION_ENCRYPTION_SALT deve ter no mínimo 16 caracteres para garantir alta entropia.");
        }
        
        try {
            byte[] salt = saltStr.getBytes(StandardCharsets.UTF_8);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATION_COUNT, KEY_LENGTH);
            SecretKey tmp = factory.generateSecret(spec);
            this.secretKey = new SecretKeySpec(tmp.getEncoded(), "AES");
        } catch (Exception e) {
            throw new IllegalStateException("CRÍTICO: Falha ao inicializar o motor criptográfico AES-256 GCM", e);
        }
    }

    public byte[] encrypt(byte[] raw) {
        if (raw == null)
            return null;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherText = cipher.doFinal(raw);

            // Prepend Version Header + IV for decryption later
            ByteBuffer byteBuffer = ByteBuffer.allocate(HEADER_LENGTH + iv.length + cipherText.length);
            byteBuffer.put(VERSION_HEADER);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return byteBuffer.array();
        } catch (Exception e) {
            logger.error("Erro estrutural durante o processo de encriptação (array de bytes)", e);
            throw new RuntimeException("Falha ao cifrar dados simétricos", e);
        }
    }

    public byte[] decrypt(byte[] encrypted) {
        if (encrypted == null)
            return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);

            if (encrypted.length < HEADER_LENGTH + GCM_IV_LENGTH) {
                throw new IllegalArgumentException("Payload criptografado malformado (menor que o tamanho do cabeçalho + IV)");
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(encrypted);
            
            // Read and validate version header
            byte[] header = new byte[HEADER_LENGTH];
            byteBuffer.get(header);
            if (!java.util.Arrays.equals(header, VERSION_HEADER)) {
                 throw new IllegalArgumentException("Versão de criptografia não suportada ou cabeçalho inválido.");
            }

            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            return cipher.doFinal(cipherText);

        } catch (AEADBadTagException e) {
            logger.error(
                    "VIOLAÇÃO DE INTEGRIDADE: GCM Auth Tag inválida! Tentativa de adulteração detectada ou chave incorreta sendo utilizada.",
                    e);
            throw new SecurityException("Crash de Integridade Criptográfica. Interrompendo requisição.", e);
        } catch (Exception e) {
            logger.error("Erro durante o processo de decriptação genérico (array de bytes)", e);
            throw new RuntimeException("Falha ao decifrar dados da aplicação", e);
        }
    }

    public String encrypt(String text) {
        if (text == null)
            return null;
        byte[] encryptedBytes = encrypt(text.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    public String decrypt(String encryptedText) {
        if (encryptedText == null)
            return null;
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);
            byte[] decryptedBytes = decrypt(decodedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (SecurityException se) {
            // Rethrow explícito de erro de integridade capturado internamente
            throw se;
        } catch (Exception e) {
            logger.error("Falha ao processar a decodificação da string criptografada.", e);
            throw new RuntimeException("Erro ao parsear dados criptografados", e);
        }
    }
    
    /**
     * Encripta um fluxo de entrada (InputStream) e escreve o resultado em um fluxo de saída (OutputStream).
     * Ideal para arquivos grandes como certificados PFX.
     * @param in InputStream contendo os dados em claro.
     * @param out OutputStream onde os dados cifrados serão escritos.
     */
    public void encryptStream(InputStream in, OutputStream out) {
         try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            // Write Header and IV to the output stream
            out.write(VERSION_HEADER);
            out.write(iv);

            try (CipherOutputStream cipherOut = new CipherOutputStream(out, cipher)) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = in.read(buffer)) != -1) {
                    cipherOut.write(buffer, 0, count);
                }
            }
        } catch (Exception e) {
            logger.error("Erro estrutural durante o processo de encriptação (stream)", e);
            throw new RuntimeException("Falha ao cifrar stream de dados simétricos", e);
        }
    }

    /**
     * Decripta um fluxo de entrada (InputStream) e escreve o resultado em um fluxo de saída (OutputStream).
     * @param in InputStream contendo os dados cifrados (com cabeçalho e IV no início).
     * @param out OutputStream onde os dados em claro serão escritos.
     */
    public void decryptStream(InputStream in, OutputStream out) {
         try {
            // Read and validate version header
            byte[] header = new byte[HEADER_LENGTH];
            int headerBytesRead = in.read(header);
            if (headerBytesRead != HEADER_LENGTH || !java.util.Arrays.equals(header, VERSION_HEADER)) {
                 throw new IllegalArgumentException("Versão de criptografia não suportada ou cabeçalho inválido no fluxo de dados.");
            }

            // Read IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            int ivBytesRead = in.read(iv);
             if (ivBytesRead != GCM_IV_LENGTH) {
                 throw new IllegalArgumentException("Fluxo criptografado malformado (falha ao ler IV)");
            }

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            try (CipherInputStream cipherIn = new CipherInputStream(in, cipher)) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = cipherIn.read(buffer)) != -1) {
                    out.write(buffer, 0, count);
                }
            } catch (Exception innerE) {
                 if (innerE.getCause() instanceof AEADBadTagException) {
                      logger.error("VIOLAÇÃO DE INTEGRIDADE: GCM Auth Tag inválida no stream! Tentativa de adulteração detectada ou chave incorreta sendo utilizada.", innerE);
                      throw new SecurityException("Crash de Integridade Criptográfica no Stream. Interrompendo requisição.", innerE);
                 }
                 throw innerE;
            }

        } catch (SecurityException se) {
             throw se;
        } catch (Exception e) {
            logger.error("Erro durante o processo de decriptação (stream)", e);
            throw new RuntimeException("Falha ao decifrar stream de dados da aplicação", e);
        }
    }
}
