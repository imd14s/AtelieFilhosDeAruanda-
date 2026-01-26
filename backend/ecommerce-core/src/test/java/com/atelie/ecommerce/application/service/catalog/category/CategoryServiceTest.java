package com.atelie.ecommerce.application.service.catalog.category;

import com.atelie.ecommerce.api.catalog.category.dto.CategoryResponse;
import com.atelie.ecommerce.api.catalog.category.dto.CreateCategoryRequest;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository repository;

    @InjectMocks
    private CategoryService service;

    @Test
    void shouldCreateCategoryAndReturnResponse() {
        CreateCategoryRequest req = new CreateCategoryRequest();
        req.setName("Guias Espirituais");
        req.setActive(true);

        when(repository.findAll()).thenReturn(List.of());

        CategoryResponse res = service.create(req);

        assertNotNull(res);
        assertNotNull(res.getId());
        assertEquals("Guias Espirituais", res.getName());
        assertEquals(true, res.getActive());

        ArgumentCaptor<CategoryEntity> captor = ArgumentCaptor.forClass(CategoryEntity.class);
        verify(repository, times(1)).save(captor.capture());

        CategoryEntity saved = captor.getValue();
        assertNotNull(saved.getId());
        assertEquals("Guias Espirituais", saved.getName());
        assertEquals(true, saved.getActive());
    }

    @Test
    void shouldThrowConflictWhenCategoryAlreadyExistsIgnoringCase() {
        CreateCategoryRequest req = new CreateCategoryRequest();
        req.setName("velas");
        req.setActive(true);

        CategoryEntity existing = new CategoryEntity();
        existing.setId(UUID.randomUUID());
        existing.setName("Velas");
        existing.setActive(true);

        when(repository.findAll()).thenReturn(List.of(existing));

        assertThrows(ConflictException.class, () -> service.create(req));
        verify(repository, never()).save(any());
    }

    @Test
    void shouldCreateEvenWhenExistingIsDifferentName() {
        CreateCategoryRequest req = new CreateCategoryRequest();
        req.setName("Defumadores");
        req.setActive(false);

        CategoryEntity existing = new CategoryEntity();
        existing.setId(UUID.randomUUID());
        existing.setName("Velas");
        existing.setActive(true);

        when(repository.findAll()).thenReturn(List.of(existing));

        CategoryResponse res = service.create(req);

        assertNotNull(res.getId());
        assertEquals("Defumadores", res.getName());
        assertEquals(false, res.getActive());

        verify(repository, times(1)).save(any(CategoryEntity.class));
    }
}
