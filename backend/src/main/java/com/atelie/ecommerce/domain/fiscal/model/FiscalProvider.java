package com.atelie.ecommerce.domain.fiscal.model;

import java.util.UUID;

/**
 * Interface para abstração de provedores de Nota Fiscal (NF-e).
 */
public interface FiscalProvider {

    String getProviderName();

    /**
     * Solicita a emissão da NF-e para o pedido especificado.
     * 
     * @param orderId ID do pedido
     * @return URL do PDF da nota ou ID da solicitação externa
     */
    String emitInvoice(UUID orderId);

    /**
     * Consulta o status da nota e retorna a URL do PDF se disponível.
     */
    String getInvoicePdfUrl(String externalReference);
}
