package com.atelie.ecommerce.domain.fiscal.nfe;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;

public interface NfeEmissionStrategy {

    /**
     * Orquestra a emissão da Nota Fiscal Eletrônica.
     * 
     * @param order       O pedido de venda com os itens.
     * @param credentials O certificado digital e senha.
     * @return O Recibo de autorização da SEFAZ, se deferido com sucesso.
     * @throws NfeIssuanceException Em caso de quebras estruturais, comunicação ou
     *                              rejeições de regra de negócio.
     */
    String emit(OrderEntity order, NfeCredentials credentials);
}
