package com.atelie.ecommerce.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Component;

@Component
public class EncryptionUtility {

    private final TextEncryptor encryptor;

    public EncryptionUtility(@Value("${INTEGRATION_ENCRYPTION_KEY:ATELIE_SECRET_TOKEN_2026_KEY}") String password,
            @Value("${INTEGRATION_ENCRYPTION_SALT:5c0744940b5c369b}") String salt) {
        String cleanSalt = salt != null ? salt.trim() : "5c0744940b5c369b";
        // O Spring Expects exactly 8 bytes (16 hex chars)
        if (cleanSalt.length() > 16) {
            cleanSalt = cleanSalt.substring(0, 16);
        }
        this.encryptor = Encryptors.text(password.trim(), cleanSalt);
    }

    public String encrypt(String text) {
        if (text == null)
            return null;
        return encryptor.encrypt(text);
    }

    public String decrypt(String encryptedText) {
        if (encryptedText == null)
            return null;
        try {
            return encryptor.decrypt(encryptedText);
        } catch (Exception e) {
            return null; // or throw custom exception
        }
    }
}
