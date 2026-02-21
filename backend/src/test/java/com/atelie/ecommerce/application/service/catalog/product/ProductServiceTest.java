package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisher;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private GtinGeneratorService gtinGenerator;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private ServiceProviderJpaRepository providerRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void saveProduct_NewProduct_ShouldCreateDefaultVariantAndPublishEvent() {
        // Arrange
        UUID categoryId = UUID.randomUUID();
        ProductEntity newProduct = new ProductEntity();
        newProduct.setName("Test Product");
        newProduct.setPrice(BigDecimal.TEN);

        CategoryEntity category = new CategoryEntity();
        category.setId(categoryId);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(productRepository.save(any(ProductEntity.class))).thenAnswer(invocation -> {
            ProductEntity p = invocation.getArgument(0);
            if (p.getId() == null)
                p.setId(UUID.randomUUID()); // Simulate DB generation
            return p;
        });
        when(gtinGenerator.generateInternalEan13()).thenReturn("1234567890123");
        when(providerRepository.findByCode(any())).thenReturn(Optional.empty());

        // Act
        ProductEntity result = productService.saveProduct(newProduct, categoryId);

        // Assert
        assertNotNull(result.getId());
        assertEquals(category, result.getCategory());

        // Verify Variant Creation
        verify(variantRepository).save(any(ProductVariantEntity.class));

        // Verify Event
        verify(eventPublisher).publishEvent(any(ProductSavedEvent.class));
    }

    @Test
    void updateProduct_ExistingProduct_ShouldUpdateFieldsAndPublishEvent() {
        // Arrange
        UUID productId = UUID.randomUUID();
        ProductEntity existing = new ProductEntity();
        existing.setId(productId);
        existing.setName("Old Name");
        existing.setStockQuantity(5);

        ProductEntity updates = new ProductEntity();
        updates.setName("New Name");
        updates.setDescription("New Desc");
        updates.setPrice(BigDecimal.valueOf(99.90));
        updates.setStockQuantity(10);

        when(productRepository.findById(productId)).thenReturn(Optional.of(existing));
        when(productRepository.save(existing)).thenReturn(existing);

        // Act
        ProductEntity result = productService.updateProduct(productId, updates);

        // Assert
        assertEquals("New Name", result.getName());
        assertEquals("New Desc", result.getDescription());
        assertEquals(BigDecimal.valueOf(99.90), result.getPrice());
        assertEquals(10, result.getStockQuantity());
        assertNotNull(result.getUpdatedAt()); // Should be updated

        verify(productRepository).save(existing);
        verify(eventPublisher).publishEvent(any(ProductSavedEvent.class));
    }

    @Test
    void updateProduct_ProductNotFound_ShouldThrowException() {
        // Arrange
        UUID productId = UUID.randomUUID();
        ProductEntity updates = new ProductEntity();

        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> productService.updateProduct(productId, updates));

        verify(productRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }
}
