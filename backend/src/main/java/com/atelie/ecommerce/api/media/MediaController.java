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

        // Append extension to URL so frontend can detect type
        String ext = "";
        String original = saved.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }

        var url = "/api/media/public/" + saved.getId() + ext;
        return ResponseEntity
                .ok(new MediaResponse(String.valueOf(saved.getId()), url, saved.getType().name(),
                        saved.getOriginalFilename()));
    }

    public record MediaResponse(String id, String url, String type, String filename) {
    }

    // Capture everything after /public/ as "filename" (including ID and extension)
    @GetMapping("/public/{filename:.+}")
    public ResponseEntity<Resource> downloadPublic(@PathVariable("filename") String filename) {
        // Extract ID from filename (e.g. "123.mp4" -> 123)
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

        Optional<Resource> opt = media.loadPublic(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = opt.get();

        String resourceFilename = resource.getFilename() != null ? resource.getFilename() : "file";
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
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resourceFilename + "\"")
                .contentType(MediaType.parseMediaType(contentType));

        if (sizeBytes >= 0) {
            builder.header(HttpHeaders.CONTENT_LENGTH, String.valueOf(sizeBytes));
        }

        return builder.body(resource);
    }
}
