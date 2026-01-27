package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateProductRequest;
import com.atelie.ecommerce.api.catalog.product.dto.ProductResponse;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @InjectMocks
    private ProductService service;

    @Test
    void shouldCreateProductWhenCategoryExists() {
        // arrange
        UUID categoryId = UUID.randomUUID();
        CategoryEntity category = new CategoryEntity();
        category.setId(categoryId);
        category.setName("Velas");
        category.setActive(true);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(productRepository.save(any(ProductEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateProductRequest req = new CreateProductRequest();
        req.setName("Vela 7 dias - Branca");
        req.setDescription("Vela premium para firmeza e oração.");
        req.setPrice(new BigDecimal("29.90"));
        req.setCategoryId(categoryId);
        req.setActive(true);

        // act
        ProductResponse res = service.create(req);

        // assert (response)
        assertNotNull(res);
        assertNotNull(res.getId());
        assertEquals("Vela 7 dias - Branca", res.getName());
        assertEquals("Vela premium para firmeza e oração.", res.getDescription());
        assertEquals(new BigDecimal("29.90"), res.getPrice());
        assertEquals(categoryId, res.getCategoryId());
        assertTrue(res.getActive());

        // assert (saved entity)
        ArgumentCaptor<ProductEntity> captor = ArgumentCaptor.forClass(ProductEntity.class);
        verify(productRepository, times(1)).save(captor.capture());

        ProductEntity saved = captor.getValue();
        assertNotNull(saved.getId());
        assertEquals(req.getName(), saved.getName());
        assertEquals(req.getDescription(), saved.getDescription());
        assertEquals(req.getPrice(), saved.getPrice());
        assertEquals(categoryId, saved.getCategory().getId());
        assertEquals(req.getActive(), saved.getActive());

        verify(categoryRepository, times(1)).findById(categoryId);
        verifyNoMoreInteractions(categoryRepository, productRepository);
    }

    @Test
    void shouldThrowNotFoundWhenCategoryDoesNotExist() {
        // arrange
        UUID categoryId = UUID.randomUUID();

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        CreateProductRequest req = new CreateProductRequest();
        req.setName("Produto X");
        req.setDescription("Desc");
        req.setPrice(new BigDecimal("10.00"));
        req.setCategoryId(categoryId);
        req.setActive(true);

        // act + assert
        NotFoundException ex = assertThrows(NotFoundException.class, () -> service.create(req));
        assertEquals("Category not found", ex.getMessage());

        verify(categoryRepository, times(1)).findById(categoryId);
        verifyNoInteractions(productRepository);
    }
}
