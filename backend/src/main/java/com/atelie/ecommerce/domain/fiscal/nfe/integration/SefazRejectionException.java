package com.atelie.ecommerce.domain.fiscal.nfe.integration;

public class SefazRejectionException extends RuntimeException {

    private final String cStat;
    private final String motivo;

    public SefazRejectionException(String message, String cStat, String motivo) {
        super(message);
        this.cStat = cStat;
        this.motivo = motivo;
    }

    public String getCStat() {
        return cStat;
    }

    public String getMotivo() {
        return motivo;
    }
}
