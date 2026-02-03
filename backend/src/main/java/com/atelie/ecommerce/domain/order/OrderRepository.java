package com.atelie.ecommerce.domain.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

/**
 * OrderRepository.
 *
 * Repositório JPA de pedidos.
 */
@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    /**
     * Soma o total de vendas considerando apenas pedidos em estados que representam receita realizada.
     *
     * Regras (produção):
     * - Considera PAID e SHIPPED.
     * - NÃO considera DELIVERED pois esse status não existe no domínio atualmente.
     *
     * @return soma do total vendido; 0 caso não haja pedidos qualificados.
     */
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM OrderEntity o
        WHERE o.status IN ('PAID','SHIPPED')
    """)
    BigDecimal sumTotalSales();
}
