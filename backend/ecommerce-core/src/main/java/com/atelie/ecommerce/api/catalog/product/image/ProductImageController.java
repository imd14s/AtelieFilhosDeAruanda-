package com.atelie.ecommerce.api.catalog.product.image;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.application.service.file.FileStorageService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductImageController {

    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    public ProductImageController(ProductRepository productRepository, FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadImage(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        String filename = fileStorageService.save(file);
        
        // CORREÇÃO: Salva apenas o nome do arquivo no banco (ex: "uuid.jpg")
        // Isso permite mudar o domínio da aplicação sem quebrar links antigos.
        product.setImageUrl(filename);
        productRepository.save(product);

        // Retorna a URL completa apenas para quem fez o upload visualizar na hora
        String fullUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(filename)
                .toUriString();

        return ResponseEntity.ok(fullUri);
    }
}
