package com.atelie.ecommerce.domain.fiscal.nfe;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;

/**
 * Porta de saída para geração de XML da Nota Fiscal Eletrônica (NF-e).
 * Isola a regra de mapeamento de infraestrutura da regra de negócio.
 */
public interface NfeXmlGeneratorPort {

    /**
     * Constrói o corpo XML 4.00 (Modelo 55) a partir das entidades do sistema.
     * Deve embutir os algoritmos de transformação, roteamento fiscal e conversões
     * MOC.
     *
     * @param order O Pedido de Venda base para criação da Nota.
     * @return O XML puramente em String aprovado e estruturado.
     */
    String generateXmlFor(OrderEntity order);

}
