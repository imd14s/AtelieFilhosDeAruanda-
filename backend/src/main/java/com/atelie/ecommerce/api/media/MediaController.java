package com.atelie.ecommerce.api.media;

import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaStorageService media;

    public MediaController(MediaStorageService media) {
        this.media = media;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
        @RequestParam("file") MultipartFile file,
        @RequestParam("type") String type,
        @RequestParam(value = "public", defaultValue = "true") boolean isPublic
    ) {
        var saved = media.upload(file, type, isPublic);
        return ResponseEntity.ok(java.util.Map.of(
            "id", saved.getId(),
            "type", saved.getType().name(),
            "mimeType", saved.getMimeType(),
            "sizeBytes", saved.getSizeBytes(),
            "isPublic", saved.isPublic(),
            "publicUrl", "/api/media/public/" + saved.getId()
        ));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<FileSystemResource> getPublic(@PathVariable("id") long id) {
        var opt = media.loadPublic(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        var dl = opt.get();
        FileSystemResource res = new FileSystemResource(dl.path().toFile());

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(dl.mimeType()))
            .contentLength(dl.sizeBytes())
            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
            .body(res);
    }
}
