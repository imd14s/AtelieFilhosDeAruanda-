package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductFavoriteRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailTemplateRepository;
import com.atelie.ecommerce.domain.marketing.model.EmailTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceDropNotificationService {

    private final ProductFavoriteRepository favoriteRepository;
    private final EmailCampaignService campaignService;
    private final EmailTemplateRepository templateRepository;

    private final DynamicConfigService configService;

    public void notifyPriceDrop(ProductEntity product) {
        log.info("Processando baixa de preço para o produto: {} (ID: {})", product.getName(), product.getId());

        BigDecimal currentPrice = product.getPrice();
        BigDecimal oldPrice = product.getLastNotifiedPrice();

        if (oldPrice == null || oldPrice.compareTo(currentPrice) <= 0) {
            return; // Segurança extra
        }

        // Calcular porcentagem de desconto
        double discount = ((oldPrice.doubleValue() - currentPrice.doubleValue()) / oldPrice.doubleValue()) * 100;
        String discountPercentage = String.format("%.0f", discount);

        // Buscar template padrão de baixa de preço
        EmailTemplate template = templateRepository
                .findByAutomationTypeAndIsActiveTrue(
                        com.atelie.ecommerce.domain.marketing.model.AutomationType.PRODUCT_PRICE_DROP)
                .orElse(null);

        String subject = "Baixou o preço! " + product.getName() + " com " + discountPercentage + "% OFF";
        String content;

        if (template != null) {
            subject = template.getSubject();
            content = template.getContent();
        } else {
            content = "<h1>O preço baixou!</h1>" +
                    "<p>O item que você favoritou, <strong>" + product.getName()
                    + "</strong>, agora está saindo por apenas <strong>R$ " + currentPrice + "</strong>!</p>" +
                    "<p>Aproveite agora!</p>";
        }

        // Preparar contexto para substituição
        String frontendUrl = configService.get("FRONTEND_URL", "http://localhost:5173");
        Map<String, String> context = new HashMap<>();
        context.put("product_name", product.getName());
        context.put("product_description", product.getDescription() != null ? product.getDescription() : "");
        context.put("old_price", oldPrice.toString());
        context.put("new_price", currentPrice.toString());
        context.put("discount_percentage", discountPercentage);
        context.put("product_image", getImageUrl(product.getMainImage()));
        context.put("product_link",
                frontendUrl + "/produto/" + (product.getSlug() != null ? product.getSlug() : product.getId()));
        context.put("customer_name", "Cliente"); // Placeholder genérico para campanhas em massa

        // Realizar substituição manual para o subject (o content será substituído no
        // loop da campanha se usássemos placeholders lá, mas passamos pronto aqui)
        for (Map.Entry<String, String> entry : context.entrySet()) {
            subject = subject.replace("{{{" + entry.getKey() + "}}}", entry.getValue());
            subject = subject.replace("{{" + entry.getKey() + "}}", entry.getValue());
            content = content.replace("{{{" + entry.getKey() + "}}}", entry.getValue());
            content = content.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }

        log.info("Notificando interessados no produto {}. Audiência: PRODUCT:{}", product.getName(), product.getId());

        campaignService.sendManualMessage(subject, content, "PRODUCT:" + product.getId());
    }

    private String getImageUrl(String imagePath) {
        if (imagePath == null || imagePath.isEmpty())
            return "";
        if (imagePath.startsWith("http"))
            return imagePath;
        String backendUrl = configService.get("BACKEND_URL", "http://localhost:8080");
        return backendUrl + (imagePath.startsWith("/") ? imagePath : "/" + imagePath);
    }
}
