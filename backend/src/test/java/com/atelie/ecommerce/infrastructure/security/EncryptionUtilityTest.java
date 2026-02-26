package com.atelie.ecommerce.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionUtilityTest {

    private EncryptionUtility encryptionUtility;

    @BeforeEach
    void setUp() throws Exception {
        // Using high entropy keys for tests matching production fail-fast rules
        encryptionUtility = new EncryptionUtility(
                "ATELIE_SECRET_TOKEN_2026_KEY_PROD",
                "5c0744940b5c369b_SALT_PROD");
        encryptionUtility.afterPropertiesSet();
    }

    @Test
    void testFailFast_NullOrEmptyParameters_ShouldThrowException() {
         EncryptionUtility util1 = new EncryptionUtility(null, "5c0744940b5c369b_SALT_PROD");
         assertThrows(IllegalArgumentException.class, util1::afterPropertiesSet);

         EncryptionUtility util2 = new EncryptionUtility("ATELIE_SECRET_TOKEN_2026_KEY_PROD", "");
         assertThrows(IllegalArgumentException.class, util2::afterPropertiesSet);
         
         EncryptionUtility util3 = new EncryptionUtility("shortkey", "5c0744940b5c369b_SALT_PROD");
         assertThrows(IllegalArgumentException.class, util3::afterPropertiesSet);
         
         EncryptionUtility util4 = new EncryptionUtility("ATELIE_SECRET_TOKEN_2026_KEY_PROD", "shortsalt");
         assertThrows(IllegalArgumentException.class, util4::afterPropertiesSet);
    }


    @Test
    void testEncryptDecrypt_ValidText_ShouldReturnOriginal() {
        // Arrange
        String originalText = "{\"appId\":\"123456\",\"appSecret\":\"secret123\"}";

        // Act
        String encrypted = encryptionUtility.encrypt(originalText);
        String decrypted = encryptionUtility.decrypt(encrypted);

        // Assert
        assertNotNull(encrypted, "Encrypted text should not be null");
        assertNotEquals(originalText, encrypted, "Encrypted text should differ from original");
        assertEquals(originalText, decrypted, "Decrypted text should match original");
    }

    @Test
    void testEncrypt_NullInput_ShouldReturnNull() {
        // Act
        String result = encryptionUtility.encrypt((String) null);

        // Assert
        assertNull(result, "Encrypting null should return null");
    }

    @Test
    void testDecrypt_NullInput_ShouldReturnNull() {
        // Act
        String result = encryptionUtility.decrypt((String) null);

        // Assert
        assertNull(result, "Decrypting null should return null");
    }

    @Test
    void testDecrypt_InvalidCiphertext_ShouldThrowException() {
        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            encryptionUtility.decrypt("invalid_ciphertext_data");
        }, "Decrypting invalid ciphertext should throw RuntimeException protecting against corruption");
    }
    
    @Test
    void testDecrypt_TamperedCiphertext_ShouldThrowSecurityException() {
        // Arrange
        byte[] originalData = "Sensible Data For Integrity Check".getBytes(StandardCharsets.UTF_8);
        byte[] encryptedData = encryptionUtility.encrypt(originalData);
        
        // Tamper with one byte (e.g., the last byte, part of the Auth Tag or Ciphertext)
        encryptedData[encryptedData.length - 1] ^= 1; 

        // Act & Assert
        assertThrows(SecurityException.class, () -> {
            encryptionUtility.decrypt(encryptedData);
        }, "Decrypting tampered ciphertext should throw SecurityException protecting against payload manipulation");
    }

    @Test
    void testDecrypt_InvalidHeader_ShouldThrowIllegalArgumentException() {
         byte[] originalData = "Sensible Data".getBytes(StandardCharsets.UTF_8);
         byte[] encryptedData = encryptionUtility.encrypt(originalData);
         
         // Tamper with the header 'v1' to 'v2'
         encryptedData[1] = '2';

         assertThrows(RuntimeException.class, () -> {
            encryptionUtility.decrypt(encryptedData);
        }, "Decrypting with wrong header should throw RuntimeException from the IllegalArgumentException");
    }


    @Test
    void testEncryptDecrypt_ComplexJson_ShouldPreserveStructure() {
        // Arrange
        String complexJson = "{\"provider\":\"mercadolivre\",\"credentials\":{\"appId\":\"ML123\",\"clientSecret\":\"secret\"},\"active\":true}";

        // Act
        String encrypted = encryptionUtility.encrypt(complexJson);
        String decrypted = encryptionUtility.decrypt(encrypted);

        // Assert
        assertEquals(complexJson, decrypted, "Complex JSON should be preserved after encrypt/decrypt cycle");
    }

    @Test
    void testEncrypt_SameInputTwice_ShouldProduceDifferentCiphertext() {
        // Arrange
        String text = "test_data";

        // Act
        String encrypted1 = encryptionUtility.encrypt(text);
        String encrypted2 = encryptionUtility.encrypt(text);

        // Assert
        // AES-GCM uses a random IV, so same plaintext produces different ciphertext
        assertNotEquals(encrypted1, encrypted2, "Same plaintext should produce different ciphertext due to random IV");

        // But both should decrypt to the same original text
        assertEquals(text, encryptionUtility.decrypt(encrypted1));
        assertEquals(text, encryptionUtility.decrypt(encrypted2));
    }
    
    @Test
    void testEncryptDecrypt_Stream_ShouldReturnOriginal() {
        // Arrange
        byte[] originalData = "stream_test_data_for_pfx_simulation_1234567890".getBytes(StandardCharsets.UTF_8);
        ByteArrayInputStream inStream = new ByteArrayInputStream(originalData);
        ByteArrayOutputStream encryptedOutStream = new ByteArrayOutputStream();

        // Act - Encrypt Stream
        encryptionUtility.encryptStream(inStream, encryptedOutStream);
        byte[] encryptedData = encryptedOutStream.toByteArray();

        // Arrange - Setup for Decrypt
        ByteArrayInputStream encryptedInStream = new ByteArrayInputStream(encryptedData);
        ByteArrayOutputStream decryptedOutStream = new ByteArrayOutputStream();

        // Act - Decrypt Stream
        encryptionUtility.decryptStream(encryptedInStream, decryptedOutStream);
        byte[] decryptedData = decryptedOutStream.toByteArray();

        // Assert
        assertNotNull(encryptedData);
        assertNotEquals(originalData, encryptedData);
        assertEquals(new String(originalData, StandardCharsets.UTF_8), new String(decryptedData, StandardCharsets.UTF_8));
    }
    
    @Test
    void testDecryptStream_TamperedData_ShouldThrowSecurityException() {
        // Arrange
        byte[] originalData = "stream_test_data_tamper".getBytes(StandardCharsets.UTF_8);
        ByteArrayInputStream inStream = new ByteArrayInputStream(originalData);
        ByteArrayOutputStream encryptedOutStream = new ByteArrayOutputStream();

        encryptionUtility.encryptStream(inStream, encryptedOutStream);
        byte[] encryptedData = encryptedOutStream.toByteArray();
        
        // Tamper with the encrypted payload
        encryptedData[encryptedData.length - 1] ^= 1; 

        ByteArrayInputStream encryptedInStream = new ByteArrayInputStream(encryptedData);
        ByteArrayOutputStream decryptedOutStream = new ByteArrayOutputStream();

        // Act & Assert
        // While processing streams, CipherInputStream wraps the exception initially. 
        // We've adjusted our decryptStream to throw a SecurityException if the inner cause is AEADBadTagException
         assertThrows(SecurityException.class, () -> {
            encryptionUtility.decryptStream(encryptedInStream, decryptedOutStream);
        });
    }
}
