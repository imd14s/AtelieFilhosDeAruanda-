package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateProductRequest;
import com.atelie.ecommerce.api.catalog.product.dto.ProductResponse;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;

    private ProductService service;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        service = new ProductService(productRepository, categoryRepository);
    }

    @Test
    void shouldCreateProductAndReturnResponse() {
        UUID categoryId = UUID.randomUUID();

        CategoryEntity category = new CategoryEntity();
        category.setId(categoryId);
        category.setName("Velas");
        category.setActive(true);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(productRepository.save(any(ProductEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateProductRequest request = new CreateProductRequest();
        request.setName("Vela 7 dias - Branca");
        request.setDescription("Vela premium para firmeza e oração.");
        request.setPrice(new BigDecimal("29.90"));
        request.setCategoryId(categoryId);
        request.setActive(true);

        ProductResponse response = service.create(request);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("Vela 7 dias - Branca", response.getName());
        assertEquals("Vela premium para firmeza e oração.", response.getDescription());
        assertEquals(new BigDecimal("29.90"), response.getPrice());
        assertEquals(categoryId, response.getCategoryId());
        assertTrue(response.getActive());

        ArgumentCaptor<ProductEntity> captor = ArgumentCaptor.forClass(ProductEntity.class);
        verify(productRepository, times(1)).save(captor.capture());

        ProductEntity saved = captor.getValue();
        assertNotNull(saved.getId());
        assertEquals("Vela 7 dias - Branca", saved.getName());
        assertEquals("Vela premium para firmeza e oração.", saved.getDescription());
        assertEquals(new BigDecimal("29.90"), saved.getPrice());
        assertNotNull(saved.getCategory());
        assertEquals(categoryId, saved.getCategory().getId());
        assertTrue(saved.getActive());

        verify(categoryRepository, times(1)).findById(categoryId);
        verifyNoMoreInteractions(categoryRepository, productRepository);
    }

    @Test
    void shouldThrowNotFoundWhenCategoryDoesNotExist() {
        UUID missingCategoryId = UUID.fromString("00000000-0000-0000-0000-000000000000");

        when(categoryRepository.findById(missingCategoryId)).thenReturn(Optional.empty());

        CreateProductRequest request = new CreateProductRequest();
        request.setName("Produto X");
        request.setDescription("Desc");
        request.setPrice(new BigDecimal("10.00"));
        request.setCategoryId(missingCategoryId);
        request.setActive(true);

        NotFoundException ex = assertThrows(NotFoundException.class, () -> service.create(request));
        assertEquals("Category not found", ex.getMessage());

        verify(categoryRepository, times(1)).findById(missingCategoryId);
        verifyNoInteractions(productRepository);
        verifyNoMoreInteractions(categoryRepository);
    }
}
