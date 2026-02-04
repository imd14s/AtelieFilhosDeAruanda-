package com.atelie.ecommerce.infra.persistence;

import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.util.UUID;
import java.math.BigDecimal;

@SpringBootTest
@ActiveProfiles("test")
public class JsonbReproductionTest {

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    public void testSaveVariantWithJsonb() {
        // Create dependency: Category
        CategoryEntity category = new CategoryEntity();
        category.setName("Cat");
        category.setId(UUID.randomUUID());
        categoryRepository.save(category);

        // Create dependency: Product
        ProductEntity product = new ProductEntity();
        product.setName("Prod");
        product.setCategory(category);
        productRepository.save(product);

        // Save Variant with JSONB
        ProductVariantEntity variant = new ProductVariantEntity();
        variant.setProduct(product);
        variant.setSku("SKU-123");
        variant.setStockQuantity(10);
        variant.setAttributesJson("{\"color\": \"red\"}"); // JSON content
        variant.setActive(true);

        variantRepository.save(variant);
    }
}
