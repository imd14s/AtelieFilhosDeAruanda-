package com.atelie.ecommerce.domain.common.security;

import java.io.InputStream;
import java.io.OutputStream;

public interface SymmetricEncryptionPort {
    byte[] encrypt(byte[] raw);

    byte[] decrypt(byte[] encrypted);

    String encrypt(String text);

    String decrypt(String encryptedText);

    void encryptStream(InputStream in, OutputStream out);

    void decryptStream(InputStream in, OutputStream out);
}
