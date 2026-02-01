package com.atelie.ecommerce.api.catalog.product;

// CORREÇÃO: Imports apontando para o pacote 'product', não 'auth'
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Collections;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final Path fileStorageLocation;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao criar diretório de uploads.", ex);
        }
    }

    @GetMapping
    public ResponseEntity<List<ProductEntity>> getAll() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getById(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProductEntity> create(@RequestBody ProductEntity product) {
        if (product.getId() == null) product.setId(UUID.randomUUID());
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        if (product.getActive() == null) product.setActive(true);
        
        return ResponseEntity.ok(productRepository.save(product));
    }
    
    // Endpoint auxiliar para processar upload e devolver URL
    // O Frontend chama isso primeiro, recebe a URL e depois manda no JSON do create
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Retorna caminho relativo para ser acessado via Static Resources
            return ResponseEntity.ok("/uploads/" + fileName);
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body("Falha no upload");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductEntity> update(@PathVariable UUID id, @RequestBody ProductEntity productDetails) {
        return productRepository.findById(id)
            .map(existing -> {
                existing.setName(productDetails.getName());
                existing.setDescription(productDetails.getDescription());
                existing.setPrice(productDetails.getPrice());
                existing.setStockQuantity(productDetails.getStockQuantity());
                existing.setImages(productDetails.getImages());
                existing.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(productRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
