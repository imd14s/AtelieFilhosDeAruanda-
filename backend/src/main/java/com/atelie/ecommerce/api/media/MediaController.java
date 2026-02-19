package com.atelie.ecommerce.api.media;

import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

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
        var url = "/api/media/public/" + saved.getId();
        return ResponseEntity
                .ok(new MediaResponse(String.valueOf(saved.getId()), url, saved.getType().name(),
                        saved.getOriginalFilename()));
    }

    public record MediaResponse(String id, String url, String type, String filename) {
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Resource> downloadPublic(@PathVariable("id") long id) {
        Optional<Resource> opt = media.loadPublic(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = opt.get();

        String filename = resource.getFilename() != null ? resource.getFilename() : "file";
        String contentType = "application/octet-stream";
        long sizeBytes = -1L;

        try {
            // Para FileSystemResource, conseguimos acessar o Path e descobrir mime
            Path path = resource.getFile().toPath();
            String probed = Files.probeContentType(path);
            if (probed != null && !probed.isBlank())
                contentType = probed;
        } catch (Exception ignored) {
            // fallback mantém octet-stream
        }

        try {
            sizeBytes = resource.contentLength();
        } catch (Exception ignored) {
            // sem content-length
        }

        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType));

        if (sizeBytes >= 0) {
            builder.header(HttpHeaders.CONTENT_LENGTH, String.valueOf(sizeBytes));
        }

        return builder.body(resource);
    }
}
