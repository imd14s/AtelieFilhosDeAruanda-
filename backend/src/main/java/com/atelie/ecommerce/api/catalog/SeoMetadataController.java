package com.atelie.ecommerce.api.catalog;

import com.atelie.ecommerce.application.service.catalog.dto.SeoMetadataDTO;
import com.atelie.ecommerce.application.service.catalog.SeoMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/seo")
@RequiredArgsConstructor
public class SeoMetadataController {

    private final SeoMetadataService seoMetadataService;

    @GetMapping("/product/{idOrSlug}")
    public ResponseEntity<SeoMetadataDTO> getProductSeo(@PathVariable String idOrSlug) {
        return seoMetadataService.getProductSeo(idOrSlug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<SeoMetadataDTO> getCategorySeo(@PathVariable UUID id) {
        return seoMetadataService.getCategorySeo(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/default")
    public ResponseEntity<SeoMetadataDTO> getDefaultSeo() {
        return ResponseEntity.ok(seoMetadataService.generateDefault());
    }
}
