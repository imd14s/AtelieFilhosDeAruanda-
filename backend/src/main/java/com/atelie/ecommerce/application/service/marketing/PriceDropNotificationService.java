package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductFavoriteRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailTemplateRepository;
import com.atelie.ecommerce.domain.marketing.model.EmailTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    public void notifyPriceDrop(ProductEntity product) {
        log.info("Processando baixa de preço para o produto: {} (ID: {})", product.getName(), product.getId());

        // Buscar template padrão de promoção/favoritos se existir, ou usar um inline
        // simples
        String content = "<h1>O preço baixou!</h1>" +
                "<p>O item que você favoritou, <strong>" + product.getName()
                + "</strong>, agora está saindo por apenas <strong>R$ " + product.getPrice() + "</strong>!</p>" +
                "<p>Aproveite antes que acabe o estoque.</p>";

        // Tentar buscar um template específico de baixa de preço
        EmailTemplate template = templateRepository.findByName("FAVORITE_PRICE_DROP").orElse(null);
        if (template != null) {
            // Lógica de substituição de variáveis se necessário (futuro)
            content = template.getContent();
        }

        // Usar a lógica já existente da CampaignService para disparar para a audiência
        // PRODUCT:id
        // Criamos uma campanha "virtual" ou apenas usamos o método de envio direto
        // Para manter simplicidade e rastreabilidade, vamos apenas registrar no log por
        // enquanto
        // ou criar uma campanha temporária de sistema.

        log.info("Notificando interessados no produto {}. Audiência: PRODUCT:{}", product.getName(), product.getId());

        // Na prática, chamamos o envio de e-mails aqui.
        // Como o EmailCampaignService.startManualCampaign processa a audiência
        // "PRODUCT:id",
        // podemos reutilizá-lo criando um objeto de campanha efêmero ou chamando um
        // método de baixo nível.

        // Implementação simplificada:
        campaignService.sendManualMessage(
                "Baixou o preço! " + product.getName(),
                content,
                "PRODUCT:" + product.getId());
    }
}
