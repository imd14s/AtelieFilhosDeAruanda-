package com.atelie.ecommerce.application.service.file;

import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * @deprecated Use MediaStorageService instead.
 * Adapter mantido para compatibilidade.
 */
@Deprecated
@Service
public class FileStorageService {

    private final MediaStorageService mediaStorageService;

    public FileStorageService(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    public String save(MultipartFile file) {
        return mediaStorageService.storeImage(file);
    }
}
