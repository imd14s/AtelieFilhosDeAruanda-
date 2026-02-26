package com.atelie.ecommerce.infrastructure.security;

import com.atelie.ecommerce.domain.common.exception.CryptoIntegrityViolationException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionUtilityTest {

    private EncryptionUtility encryptionUtility;
    private EncryptionUtility encryptionUtilityNoV1;

    @BeforeEach
    void setUp() throws Exception {
        encryptionUtility = new EncryptionUtility(
                "ATELIE_SECRET_V2_KEY_PROD2024".toCharArray(),
                "1c0744940b5c369b_SALT_V2".toCharArray(),
                "ATELIE_SECRET_TOKEN_2026_KEY_PROD".toCharArray(),
                "5c0744940b5c369b_SALT_PROD".toCharArray());
        encryptionUtility.afterPropertiesSet();

        encryptionUtilityNoV1 = new EncryptionUtility(
                "ATELIE_SECRET_V2_KEY_PROD2024".toCharArray(),
                "1c0744940b5c369b_SALT_V2".toCharArray(),
                null,
                null);
        encryptionUtilityNoV1.afterPropertiesSet();
    }

    @Test
    void testFailFast_NullOrEmptyParameters_ShouldThrowException() {
        EncryptionUtility util1 = new EncryptionUtility("".toCharArray(), "1c0744940b5c369b_SALT_V2".toCharArray(),
                null, null);
        assertThrows(IllegalArgumentException.class, util1::afterPropertiesSet);

        EncryptionUtility util2 = new EncryptionUtility("ATELIE_SECRET_V2_KEY_PROD2024".toCharArray(), "".toCharArray(),
                null, null);
        assertThrows(IllegalArgumentException.class, util2::afterPropertiesSet);

        EncryptionUtility util3 = new EncryptionUtility("short".toCharArray(), "1c0744940b5c369b_SALT_V2".toCharArray(),
                null, null);
        assertThrows(IllegalArgumentException.class, util3::afterPropertiesSet);
    }

    @Test
    void testEncryptDecrypt_ValidText_ShouldReturnOriginal() {
        String originalText = "{\"appId\":\"123456\",\"appSecret\":\"secret123\"}";

        String encrypted = encryptionUtility.encrypt(originalText);
        String decrypted = encryptionUtility.decrypt(encrypted);

        assertNotNull(encrypted, "Encrypted text should not be null");
        assertNotEquals(originalText, encrypted, "Encrypted text should differ from original");
        assertEquals(originalText, decrypted, "Decrypted text should match original");
    }

    @Test
    void testDecrypt_LegacyV1Header_ShouldDecryptWithV1Key() throws Exception {
        // Create an explicitly V1 instance
        EncryptionUtility v1Util = new EncryptionUtility(
                "ATELIE_SECRET_TOKEN_2026_KEY_PROD".toCharArray(),
                "5c0744940b5c369b_SALT_PROD".toCharArray(),
                null, null);

        // Wait! Let's hack the version to V1 on the instance using reflection just to
        // simulate a legacy payload,
        // since our v1Util uses V2 primary inside.
        // We will mock the V1 payload manually.
        // Or simpler, create an old payload using a temporary util matching old V1
        // source:
        // Well, V1 is identical to V2 but with 'v', '1' header.
        byte[] v1PayloadFake = makeV1PayloadFake();
        byte[] decrypted = encryptionUtility.decrypt(v1PayloadFake);
        assertEquals("test_v1_legacy_data", new String(decrypted));
    }

    private byte[] makeV1PayloadFake() throws Exception {
        EncryptionUtility legacyGens = new EncryptionUtility(
                "ATELIE_SECRET_TOKEN_2026_KEY_PROD".toCharArray(),
                "5c0744940b5c369b_SALT_PROD".toCharArray(),
                null, null);
        legacyGens.afterPropertiesSet();
        byte[] encrypted = legacyGens.encrypt("test_v1_legacy_data".getBytes(StandardCharsets.UTF_8));
        // By default V2 is generated. We must change the first two bytes to 'v', '1'.
        // Wait, the key used will be the V2 slot for legacyGens, but it's identical to
        // V1 keys for main util.
        // If we change header to 'v', '1', the main util will use V1 slot (which holds
        // ATELIE_SECRET_TOKEN_2026_KEY_PROD).
        encrypted[0] = 'v';
        encrypted[1] = '1';
        return encrypted;
    }

    @Test
    void testDecrypt_NullInput_ShouldReturnNull() {
        String result = encryptionUtility.decrypt((String) null);
        assertNull(result, "Decrypting null should return null");
    }

    @Test
    void testDecrypt_InvalidCiphertext_ShouldThrowException() {
        assertThrows(RuntimeException.class, () -> {
            encryptionUtility.decrypt("invalid_ciphertext_data");
        }, "Decrypting invalid ciphertext should throw RuntimeException");
    }

    @Test
    void testDecrypt_TamperedCiphertext_ShouldThrowCryptoException() {
        byte[] originalData = "Sensible Data For Integrity Check".getBytes(StandardCharsets.UTF_8);
        byte[] encryptedData = encryptionUtility.encrypt(originalData);

        encryptedData[encryptedData.length - 1] ^= 1;

        assertThrows(CryptoIntegrityViolationException.class, () -> {
            encryptionUtility.decrypt(encryptedData);
        }, "Decrypting tampered ciphertext should throw CryptoIntegrityViolationException");
    }

    @Test
    void testDecrypt_InvalidHeader_ShouldThrowRuntimeException() {
        byte[] originalData = "Sensible Data".getBytes(StandardCharsets.UTF_8);
        byte[] encryptedData = encryptionUtility.encrypt(originalData);

        // Tamper with the header 'v2' to 'v3'
        encryptedData[1] = '3';

        assertThrows(RuntimeException.class, () -> {
            encryptionUtility.decrypt(encryptedData);
        }, "Decrypting with wrong header should throw RuntimeException");
    }

    @Test
    void testEncryptDecrypt_ComplexJson_ShouldPreserveStructure() {
        String complexJson = "{\"provider\":\"mercadolivre\",\"credentials\":{\"appId\":\"ML123\",\"clientSecret\":\"secret\"},\"active\":true}";

        String encrypted = encryptionUtility.encrypt(complexJson);
        String decrypted = encryptionUtility.decrypt(encrypted);

        assertEquals(complexJson, decrypted, "Complex JSON should be preserved after encrypt/decrypt cycle");
    }

    @Test
    void testEncrypt_SameInputTwice_ShouldProduceDifferentCiphertext() {
        String text = "test_data";

        String encrypted1 = encryptionUtility.encrypt(text);
        String encrypted2 = encryptionUtility.encrypt(text);

        assertNotEquals(encrypted1, encrypted2, "Same plaintext should produce different ciphertext due to random IV");
        assertEquals(text, encryptionUtility.decrypt(encrypted1));
        assertEquals(text, encryptionUtility.decrypt(encrypted2));
    }

    @Test
    void testEncryptDecrypt_Stream_ShouldReturnOriginal() {
        byte[] originalData = "stream_test_data_for_pfx_simulation_1234567890".getBytes(StandardCharsets.UTF_8);
        ByteArrayInputStream inStream = new ByteArrayInputStream(originalData);
        ByteArrayOutputStream encryptedOutStream = new ByteArrayOutputStream();

        encryptionUtility.encryptStream(inStream, encryptedOutStream);
        byte[] encryptedData = encryptedOutStream.toByteArray();

        ByteArrayInputStream encryptedInStream = new ByteArrayInputStream(encryptedData);
        ByteArrayOutputStream decryptedOutStream = new ByteArrayOutputStream();

        encryptionUtility.decryptStream(encryptedInStream, decryptedOutStream);
        byte[] decryptedData = decryptedOutStream.toByteArray();

        assertNotNull(encryptedData);
        assertNotEquals(originalData, encryptedData);
        assertEquals(new String(originalData, StandardCharsets.UTF_8),
                new String(decryptedData, StandardCharsets.UTF_8));
    }

    @Test
    void testDecryptStream_TamperedData_ShouldThrowCryptoException() {
        byte[] originalData = "stream_test_data_tamper".getBytes(StandardCharsets.UTF_8);
        ByteArrayInputStream inStream = new ByteArrayInputStream(originalData);
        ByteArrayOutputStream encryptedOutStream = new ByteArrayOutputStream();

        encryptionUtility.encryptStream(inStream, encryptedOutStream);
        byte[] encryptedData = encryptedOutStream.toByteArray();

        encryptedData[encryptedData.length - 1] ^= 1;

        ByteArrayInputStream encryptedInStream = new ByteArrayInputStream(encryptedData);
        ByteArrayOutputStream decryptedOutStream = new ByteArrayOutputStream();

        assertThrows(CryptoIntegrityViolationException.class, () -> {
            encryptionUtility.decryptStream(encryptedInStream, decryptedOutStream);
        });
    }
}
