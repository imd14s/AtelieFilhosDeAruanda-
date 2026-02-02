package com.atelie.ecommerce.application.service.ai;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.application.service.file.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.util.Map;
import java.util.UUID;

@Service
@lombok.extern.slf4j.Slf4j
public class AiContentService {

    private final DynamicConfigService configService;
    private final RestTemplate restTemplate;
    
    // Caminho físico onde o FileStorageService salva
    private final Path uploadRoot = Paths.get("./uploads");

    public AiContentService(DynamicConfigService configService, RestTemplate restTemplate) {
        this.configService = configService;
        this.restTemplate = restTemplate;
    }

    public String generateDescription(String productName, String context) {
        if (!configService.containsKey("AI_ENABLED") || !configService.requireBoolean("AI_ENABLED")) {
            return "Descrição automática (IA Desativada): " + productName;
        }

        String apiUrl = configService.getString("AI_API_URL");
        String apiKey = configService.getString("AI_API_KEY");
        String model = configService.getString("AI_MODEL");
        String promptTemplate = configService.getString("AI_PROMPT_TEMPLATE_DESC");
        
        if (apiUrl == null || apiKey == null) return "Erro de Configuração de IA";

        String finalPrompt = promptTemplate
                .replace("{product}", productName)
                .replace("{context}", context != null ? context : "");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = Map.of("role", "user", "content", finalPrompt);
            Map<String, Object> body = Map.of(
                "model", model,
                "messages", new Object[]{ message },
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            Map response = restTemplate.postForObject(apiUrl, entity, Map.class);
            return extractContent(response);

        } catch (Exception e) {
            log.error("Erro ao chamar IA", e);
            return "Erro na geração: " + e.getMessage();
        }
    }

    public String removeImageBackground(String filename) {
        // 1. Verificação de Configuração
        if (!configService.containsKey("AI_REMOVE_BG_ENABLED") || !configService.requireBoolean("AI_REMOVE_BG_ENABLED")) {
            log.info("Remoção de fundo desativada no Dashboard.");
            return filename; // Retorna original
        }

        String apiKey = configService.getString("AI_REMOVE_BG_API_KEY");
        String apiUrl = configService.getString("AI_REMOVE_BG_URL");

        if (apiKey == null || apiKey.isBlank()) {
            log.error("API Key do Remove.bg não configurada.");
            return filename;
        }

        try {
            // 2. Localizar arquivo no disco
            Path sourcePath = uploadRoot.resolve(filename);
            if (!Files.exists(sourcePath)) {
                throw new RuntimeException("Arquivo original não encontrado: " + filename);
            }

            // 3. Preparar Multipart Request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("X-Api-Key", apiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image_file", new FileSystemResource(sourcePath));
            body.add("size", "auto");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 4. Chamada Real à API
            log.info("Enviando imagem {} para Remove.bg...", filename);
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    byte[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // 5. Salvar Nova Imagem (No-BG)
                String newFilename = "no-bg-" + UUID.randomUUID() + ".png";
                Path destPath = uploadRoot.resolve(newFilename);
                Files.write(destPath, response.getBody());
                
                log.info("Fundo removido com sucesso. Salvo em: {}", newFilename);
                return newFilename;
            } else {
                log.error("Erro API Remove.bg: {}", response.getStatusCode());
                return filename; // Fallback
            }

        } catch (Exception e) {
            log.error("Falha crítica na remoção de fundo", e);
            return filename; // Fallback para não quebrar o fluxo
        }
    }

    private String extractContent(Map response) {
        try {
            java.util.List choices = (java.util.List) response.get("choices");
            Map first = (Map) choices.get(0);
            Map msg = (Map) first.get("message");
            return (String) msg.get("content");
        } catch (Exception e) {
            return "Conteúdo gerado, mas erro no parse.";
        }
    }
}
