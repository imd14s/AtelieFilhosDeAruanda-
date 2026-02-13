package com.atelie.ecommerce.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionUtilityTest {

    private EncryptionUtility encryptionUtility;

    @BeforeEach
    void setUp() {
        // Using the same defaults as the production code
        encryptionUtility = new EncryptionUtility(
                "ATELIE_SECRET_TOKEN_2026_KEY",
                "5c0744940b5c369b");
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
        String result = encryptionUtility.encrypt(null);

        // Assert
        assertNull(result, "Encrypting null should return null");
    }

    @Test
    void testDecrypt_NullInput_ShouldReturnNull() {
        // Act
        String result = encryptionUtility.decrypt(null);

        // Assert
        assertNull(result, "Decrypting null should return null");
    }

    @Test
    void testDecrypt_InvalidCiphertext_ShouldReturnNull() {
        // Act
        String result = encryptionUtility.decrypt("invalid_ciphertext_data");

        // Assert
        assertNull(result, "Decrypting invalid ciphertext should return null");
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
        // Spring Security's Encryptors.text uses a random IV, so same plaintext
        // produces different ciphertext
        assertNotEquals(encrypted1, encrypted2, "Same plaintext should produce different ciphertext due to random IV");

        // But both should decrypt to the same original text
        assertEquals(text, encryptionUtility.decrypt(encrypted1));
        assertEquals(text, encryptionUtility.decrypt(encrypted2));
    }
}
