package com.atelie.ecommerce.application.service.ai;

import com.atelie.ecommerce.application.common.exception.BusinessException;
import com.atelie.ecommerce.application.service.config.AiConfigService;
import com.atelie.ecommerce.infrastructure.persistence.config.AiConfigEntity;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GeminiIntegrationService {

    private final AiConfigService aiConfigService;
    private final MediaStorageService mediaStorageService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiIntegrationService(AiConfigService aiConfigService, MediaStorageService mediaStorageService,
            ObjectMapper objectMapper) {
        this.aiConfigService = aiConfigService;
        this.mediaStorageService = mediaStorageService;
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    public Map<String, String> generateProductInfo(String title, String imageUrl) {
        AiConfigEntity geminiConfig = aiConfigService.getGeminiConfig();

        String key = geminiConfig.getApiKey();
        if (key == null || key.isBlank()) {
            throw new BusinessException("Chave da API do Gemini não configurada.");
        }

        String prePrompt = geminiConfig.getPrePrompt();
        if (prePrompt == null || prePrompt.isBlank()) {
            prePrompt = "Gere um título otimizado e uma descrição atrativa para o seguinte produto. Retorne apenas JSON com as chaves 'title' e 'description'.";
        }

        String prompt = prePrompt + "\n\nTítulo informado pelo usuário: " + title;

        String base64Image = null;
        String mimeType = "image/jpeg";

        if (imageUrl != null && !imageUrl.isBlank()) {
            try {
                // Parse UUID from url assuming format /api/media/public/{id}
                String idStr = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                long mediaId = Long.parseLong(idStr);
                Optional<Resource> resourceOpt = mediaStorageService.loadPublic(mediaId);

                if (resourceOpt.isPresent()) {
                    Resource resource = resourceOpt.get();
                    byte[] bytes = resource.getContentAsByteArray();
                    base64Image = Base64.getEncoder().encodeToString(bytes);

                    String filename = resource.getFilename();
                    if (filename != null) {
                        if (filename.toLowerCase().endsWith(".png"))
                            mimeType = "image/png";
                        else if (filename.toLowerCase().endsWith(".webp"))
                            mimeType = "image/webp";
                    }
                }
            } catch (Exception e) {
                System.err.println("Erro ao carregar imagem para o Gemini: " + e.getMessage());
                // Silently ignore image error and proceed with text only
            }
        }

        return callGeminiVisionApi(key, prompt, base64Image, mimeType);
    }

    private Map<String, String> callGeminiVisionApi(String apiKey, String prompt, String base64Image, String mimeType) {
        // Models: gemini-1.5-flash or gemini-pro-vision (1.5 flash recommended for
        // multimodality)
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                + apiKey;

        try {
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            List<Object> parts = new java.util.ArrayList<>();
            parts.add(textPart);

            if (base64Image != null) {
                Map<String, Object> inlineData = new HashMap<>();
                inlineData.put("mimeType", mimeType);
                inlineData.put("data", base64Image);

                Map<String, Object> imagePart = new HashMap<>();
                imagePart.put("inlineData", inlineData);
                parts.add(imagePart);
            }

            Map<String, Object> content = new HashMap<>();
            content.put("parts", parts);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            // Force JSON response
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            String responseRaw = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseRaw);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");

            String generatedJsonString = textNode.asText();

            // Parse the JSON string from Gemini (usually {"title": "...", "description":
            // "..."})
            JsonNode resultJson = objectMapper.readTree(generatedJsonString);

            Map<String, String> resultMap = new HashMap<>();
            resultMap.put("title", resultJson.path("title").asText(titleIfBlank(resultJson.path("title").asText())));
            resultMap.put("description", resultJson.path("description").asText(""));

            return resultMap;

        } catch (Exception e) {
            System.err.println("Erro na chamada à API Gemini: " + e.getMessage());
            throw new BusinessException("Falha ao se comunicar com a inteligência artificial.");
        }
    }

    public Map<String, Object> moderateReview(String comment, List<Map<String, String>> media) {
        AiConfigEntity geminiConfig = aiConfigService.getGeminiConfig();
        String key = geminiConfig.getApiKey();
        if (key == null || key.isBlank()) {
            throw new BusinessException("Chave da API do Gemini não configurada.");
        }

        StringBuilder prompt = new StringBuilder(
                "Analise a seguinte avaliação de produto. Verifique se há conteúdo impróprio (nudez, violência, discurso de ódio, spam ou ofensas).\n");
        prompt.append(
                "Retorne APENAS um JSON com as chaves 'safe' (boolean), 'score' (number 0-1) e 'reason' (string).\n\n");
        prompt.append("Comentário: ").append(comment);

        List<Object> parts = new java.util.ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);

        if (media != null) {
            for (Map<String, String> m : media) {
                if ("IMAGE".equals(m.get("type"))) {
                    try {
                        String imageUrl = m.get("url");
                        String idStr = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                        long mediaId = Long.parseLong(idStr);
                        Optional<Resource> resourceOpt = mediaStorageService.loadPublic(mediaId);

                        if (resourceOpt.isPresent()) {
                            Resource resource = resourceOpt.get();
                            byte[] bytes = resource.getContentAsByteArray();
                            String base64Image = Base64.getEncoder().encodeToString(bytes);

                            Map<String, Object> inlineData = new HashMap<>();
                            inlineData.put("mimeType", getMimeType(resource.getFilename()));
                            inlineData.put("data", base64Image);

                            Map<String, Object> imagePart = new HashMap<>();
                            imagePart.put("inlineData", inlineData);
                            parts.add(imagePart);
                        }
                    } catch (Exception e) {
                        System.err.println("Erro ao carregar imagem para moderação: " + e.getMessage());
                    }
                }
            }
        }

        return callGeminiMultiPartApi(key, parts);
    }

    private String getMimeType(String filename) {
        if (filename == null)
            return "image/jpeg";
        if (filename.toLowerCase().endsWith(".png"))
            return "image/png";
        if (filename.toLowerCase().endsWith(".webp"))
            return "image/webp";
        return "image/jpeg";
    }

    private Map<String, Object> callGeminiMultiPartApi(String apiKey, List<Object> parts) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                + apiKey;

        try {
            Map<String, Object> content = new HashMap<>();
            content.put("parts", parts);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            String responseRaw = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseRaw);
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            JsonNode resultJson = objectMapper.readTree(text);

            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("safe", resultJson.path("safe").asBoolean(true));
            resultMap.put("score", new BigDecimal(resultJson.path("score").asText("1.0")));
            resultMap.put("reason", resultJson.path("reason").asText(""));

            return resultMap;

        } catch (Exception e) {
            System.err.println("Erro na moderação Gemini: " + e.getMessage());
            return Map.of("safe", true, "score", BigDecimal.ONE, "reason", ""); // Default to safe if IA fails
        }
    }

    private String titleIfBlank(String t) {
        return t != null && !t.isBlank() ? t : "";
    }
}
