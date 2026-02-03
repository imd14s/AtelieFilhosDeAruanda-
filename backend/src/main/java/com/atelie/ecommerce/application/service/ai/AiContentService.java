package com.atelie.ecommerce.application.service.ai;

import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiContentService {

    private final MediaStorageService mediaStorageService;

    public AiContentService(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    public String processAndStore(MultipartFile file) {
        // futuramente: processamento IA
        return mediaStorageService.storeImage(file);
    }
}
