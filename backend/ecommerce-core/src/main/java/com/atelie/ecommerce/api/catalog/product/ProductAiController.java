package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.application.service.ai.AiContentService;
import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductAiController {

    private final AiContentService aiService;
    private final ProductService productService;
    private final ProductRepository productRepository;

    public ProductAiController(AiContentService aiService, 
                               ProductService productService,
                               ProductRepository productRepository) {
        this.aiService = aiService;
        this.productService = productService;
        this.productRepository = productRepository;
    }

    @PostMapping("/{id}/ai/generate-description")
    public ResponseEntity<Map<String, String>> generateDescription(@PathVariable UUID id) {
        ProductEntity product = productService.findById(id);
        
        // Pega atributos técnicos do JSONB ou nome
        String context = "Produto do Ateliê Filhos de Aruanda";
        
        String description = aiService.generateDescription(product.getName(), context);
        
        // Opcional: Já salva no produto ou só retorna para o Admin aprovar?
        // Aqui retornamos para o Admin ver, editar e depois salvar via PUT.
        return ResponseEntity.ok(Map.of("description", description));
    }

    @PostMapping("/{id}/ai/remove-background")
    public ResponseEntity<Map<String, String>> removeBackground(@PathVariable UUID id) {
        ProductEntity product = productService.findById(id);
        
        if (product.getImageUrl() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Produto não tem imagem"));
        }

        String newUrl = aiService.removeImageBackground(product.getImageUrl());
        
        // Atualiza automático
        product.setImageUrl(newUrl);
        productRepository.save(product); // Dispara evento de sync também!

        return ResponseEntity.ok(Map.of("newImageUrl", newUrl));
    }
}
