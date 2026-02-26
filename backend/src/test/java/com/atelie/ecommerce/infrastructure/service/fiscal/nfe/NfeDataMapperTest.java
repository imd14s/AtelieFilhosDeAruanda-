package com.atelie.ecommerce.infrastructure.service.fiscal.nfe;

import com.atelie.ecommerce.domain.common.exception.NfeValidationException;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NfeDataMapperTest {

    private NfeDataMapper dataMapper;
    private NfeXmlValidator mockValidator;

    @BeforeEach
    void setUp() {
        mockValidator = Mockito.mock(NfeXmlValidator.class);
        dataMapper = new NfeDataMapper(mockValidator);
    }

    @Test
    void shouldGenerateValidNfeXmlWithCorrectRoundingAndData() {
        // Arrange
        OrderEntity order = new OrderEntity();
        order.setId(UUID.randomUUID());
        order.setCustomerName("João Silva");
        order.setCustomerDocument("12345678909");
        order.setCreatedAt(Instant.parse("2023-10-01T10:00:00Z"));
        order.setShippingState("SP");
        order.setShippingCity("São Paulo");
        order.setShippingZipCode("01000-000");
        order.setShippingCost(new BigDecimal("15.50"));
        order.setTotalAmount(new BigDecimal("115.50"));

        ProductEntity product = new ProductEntity();
        product.setId(UUID.randomUUID());
        product.setName("Colar de Búzios");
        product.setNcm("71171900");

        OrderItemEntity item = new OrderItemEntity();
        item.setProduct(product);
        item.setProductName(product.getName());
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("50.00"));
        item.setTotalPrice(new BigDecimal("100.00"));
        order.getItems().add(item);

        // Act
        String resultXml = dataMapper.generateNfeXml(order);

        // Assert
        assertThat(resultXml).isNotNull();
        assertThat(resultXml).contains("<NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\">");

        // Verifica TAGS IDE
        assertThat(resultXml).contains("<cUF>35</cUF>"); // Estado Padrão SP Emitente
        assertThat(resultXml).contains("<idDest>1</idDest>"); // Operação Interna
        assertThat(resultXml).contains("<dhEmi>2023-10-01T07:00:00-03:00</dhEmi>"); // Conversão Hora SP (UTC-3)

        // Verifica arredondamento/formatação MOC
        assertThat(resultXml).contains("<qCom>2.0000</qCom>"); // 4 casas
        assertThat(resultXml).contains("<vUnCom>50.0000000000</vUnCom>"); // 10 casas
        assertThat(resultXml).contains("<vProd>100.00</vProd>"); // 2 casas

        // Verifica Destinatário
        assertThat(resultXml).contains("<CPF>12345678909</CPF>");
        assertThat(resultXml).contains("<CEP>01000000</CEP>"); // Higienização de hífens

        // Verifica Totais
        assertThat(resultXml).contains("<vFrete>15.50</vFrete>");
        assertThat(resultXml).contains("<vNF>115.50</vNF>"); // Produto + Frete

        // Verifica Simples Nacional CSOSN e NCM
        assertThat(resultXml).contains("<CSOSN>102</CSOSN>");
        assertThat(resultXml).contains("<NCM>71171900</NCM>");

        // Validador deve ser invocado (se descomentado no código principal na subida
        // oficial)
        // Mockito.verify(mockValidator).validate(resultXml);
    }

    @Test
    void shouldThrowExceptionWhenOrderIsNullAndCauseCrashInTransformer() {
        // Enviar pedido nulo causa null pointers na construção inicial do XML
        assertThatThrownBy(() -> dataMapper.generateNfeXml(null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Falha catastrófica ao mapear XML da NF-e para Pedido null");
    }
}
