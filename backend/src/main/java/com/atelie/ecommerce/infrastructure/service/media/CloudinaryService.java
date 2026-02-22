package com.atelie.ecommerce.infrastructure.service.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.url}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    public String upload(MultipartFile file) {
        try {
            return upload(file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Falha ao ler bytes do arquivo", e);
        }
    }

    public String upload(byte[] bytes) {
        try {
            Map uploadResult = cloudinary.uploader().upload(bytes, ObjectUtils.emptyMap());
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Falha ao fazer upload para o Cloudinary", e);
        }
    }

    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Falha ao deletar do Cloudinary", e);
        }
    }

    /**
     * Extrai o public_id de uma URL do Cloudinary
     */
    public String extractPublicId(String url) {
        if (url == null || !url.contains("cloudinary.com"))
            return null;
        // Exemplo:
        // https://res.cloudinary.com/dwkv9hnnk/image/upload/v12345/public_id.jpg
        String[] parts = url.split("/");
        String fileName = parts[parts.length - 1];
        return fileName.split("\\.")[0];
    }
}
