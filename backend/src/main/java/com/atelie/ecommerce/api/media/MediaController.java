package com.atelie.ecommerce.api.media;

import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    private final MediaStorageService media;

    public MediaController(MediaStorageService media) {
        this.media = media;
    }

    @PostMapping("/upload")
    public ResponseEntity<MediaResponse> upload(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "public", defaultValue = "false") boolean isPublic) {
        var saved = media.upload(file, category, isPublic);

        return ResponseEntity
                .ok(new MediaResponse(String.valueOf(saved.getId()), saved.getStorageKey(), saved.getType().name(),
                        saved.getOriginalFilename()));
    }

    public record MediaResponse(String id, String url, String type, String filename) {
    }

    @GetMapping("/public/{filename:.+}")
    public ResponseEntity<Void> downloadPublic(@PathVariable("filename") String filename) {
        long id;
        try {
            String idStr = filename;
            if (idStr.contains(".")) {
                idStr = idStr.substring(0, idStr.lastIndexOf("."));
            }
            id = Long.parseLong(idStr);
        } catch (NumberFormatException e) {
            return ResponseEntity.notFound().build();
        }

        return media.getUrl(id)
                .map(url -> ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(url))
                        .<Void>build())
                .orElse(ResponseEntity.notFound().build());
    }
}
