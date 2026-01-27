package com.atelie.ecommerce.infrastructure.persistence.order;

import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.entity.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.entity.OrderItemEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void shouldSaveOrderWithItems() {
        // 1. Setup Categoria (Capturar retorno salvo!)
        CategoryEntity category = new CategoryEntity();
        category.setId(UUID.randomUUID());
        category.setName("Test Category");
        category.setActive(true);
        CategoryEntity savedCategory = categoryRepository.save(category);

        // 2. Setup Produto (Usar categoria salva e capturar produto salvo!)
        ProductEntity product = new ProductEntity();
        product.setId(UUID.randomUUID());
        product.setName("Test Product");
        product.setDescription("Description");
        product.setPrice(BigDecimal.TEN);
        product.setActive(true);
        product.setCategory(savedCategory); // Link com managed entity
        ProductEntity savedProduct = productRepository.save(product);

        // 3. Criar Pedido
        OrderEntity order = new OrderEntity(
                OrderSource.INTERNAL,
                null,
                "Cliente Teste",
                new BigDecimal("20.00")
        );

        // 4. Adicionar Item (Usar produto salvo!)
        OrderItemEntity item = new OrderItemEntity(order, savedProduct, 2, BigDecimal.TEN);
        order.addItem(item);

        // 5. Salvar (Deve salvar itens por Cascade)
        OrderEntity savedOrder = orderRepository.save(order);

        // 6. Validar
        assertThat(savedOrder.getId()).isNotNull();
        assertThat(savedOrder.getItems()).hasSize(1);
        assertThat(savedOrder.getItems().get(0).getProduct().getName()).isEqualTo("Test Product");
    }

    @Test
    void shouldFindByExternalId() {
        // 1. Setup
        OrderEntity order = new OrderEntity(
                OrderSource.MERCADO_LIVRE,
                "MLB-123456",
                "Comprador ML",
                BigDecimal.ONE
        );
        orderRepository.save(order);

        // 2. Busca (Passando o Enum correto)
        Optional<OrderEntity> found = orderRepository.findByExternalIdAndSource("MLB-123456", OrderSource.MERCADO_LIVRE);

        // 3. Valida
        assertThat(found).isPresent();
        assertThat(found.get().getCustomerName()).isEqualTo("Comprador ML");
    }
}
