package com.atelie.ecommerce.domain.fiscal.nfe;

public class NfeCredentials {

    private final byte[] certificateBytes;
    private final String encryptedPassword;
    private final boolean isProduction;

    public NfeCredentials(byte[] certificateBytes, String encryptedPassword, boolean isProduction) {
        this.certificateBytes = certificateBytes;
        this.encryptedPassword = encryptedPassword;
        this.isProduction = isProduction;
    }

    public byte[] getCertificateBytes() {
        return certificateBytes;
    }

    public String getEncryptedPassword() {
        return encryptedPassword;
    }

    public boolean isProduction() {
        return isProduction;
    }
}
