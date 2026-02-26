package com.atelie.ecommerce.domain.fiscal.nfe;

/**
 * Exceção consolidada que encapsula falhas estritas ocorridas durante todo o
 * ciclo de emissão da NF-e
 * (Data Mapping, Validação XSD, Assinatura Digital e Transmissão MTLS).
 */
public class NfeIssuanceException extends RuntimeException {

    private final String cStat;
    private final String reason;

    public NfeIssuanceException(String message) {
        super(message);
        this.cStat = null;
        this.reason = null;
    }

    public NfeIssuanceException(String message, Throwable cause) {
        super(message, cause);
        this.cStat = null;
        this.reason = null;
    }

    public NfeIssuanceException(String message, String cStat, String reason, Throwable cause) {
        super(message, cause);
        this.cStat = cStat;
        this.reason = reason;
    }

    public String getCStat() {
        return cStat;
    }

    public String getReason() {
        return reason;
    }
}
