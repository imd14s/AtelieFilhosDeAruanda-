package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailCampaign;
import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.domain.marketing.model.EmailSignature;
import com.atelie.ecommerce.domain.marketing.model.NewsletterSubscriber;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailCampaignRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.NewsletterSubscriberRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductFavoriteRepository;
import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmailCampaignService {

    private final EmailCampaignRepository campaignRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final NewsletterSubscriberRepository subscriberRepository;
    private final ProductFavoriteRepository productFavoriteRepository;
    private final UserRepository userRepository;
    private final EmailSignatureService signatureService;
    private final DynamicConfigService configService;

    public EmailCampaignService(EmailCampaignRepository campaignRepository,
            EmailQueueRepository emailQueueRepository,
            NewsletterSubscriberRepository subscriberRepository,
            ProductFavoriteRepository productFavoriteRepository,
            UserRepository userRepository,
            EmailSignatureService signatureService,
            DynamicConfigService configService) {
        this.campaignRepository = campaignRepository;
        this.emailQueueRepository = emailQueueRepository;
        this.subscriberRepository = subscriberRepository;
        this.productFavoriteRepository = productFavoriteRepository;
        this.userRepository = userRepository;
        this.signatureService = signatureService;
        this.configService = configService;
    }

    @Transactional
    public EmailCampaign createCampaign(EmailCampaign campaign) {
        campaign.setStatus(EmailCampaign.CampaignStatus.PENDING);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public EmailCampaign updateCampaign(UUID id, EmailCampaign dto) {
        EmailCampaign existing = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campanha não encontrada"));
        if (existing.getStatus() == EmailCampaign.CampaignStatus.SENDING
                || existing.getStatus() == EmailCampaign.CampaignStatus.COMPLETED) {
            throw new IllegalStateException("Não é possível editar uma campanha em envio ou concluída.");
        }
        existing.setName(dto.getName());
        existing.setSubject(dto.getSubject());
        existing.setAudience(dto.getAudience());
        existing.setContent(dto.getContent());
        existing.setSignatureId(dto.getSignatureId());
        return campaignRepository.save(existing);
    }

    @Transactional
    public void deleteCampaign(UUID id) {
        EmailCampaign existing = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campanha não encontrada"));

        // Remove pending emails from queue to prevent sending deleted campaign emails
        List<EmailQueue> pendingEmails = emailQueueRepository.findByCampaignIdAndStatus(id,
                EmailQueue.EmailStatus.PENDING);
        emailQueueRepository.deleteAll(pendingEmails);

        campaignRepository.delete(existing);
    }

    @Transactional
    public void cancelCampaign(UUID id) {
        EmailCampaign existing = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campanha não encontrada"));

        if (existing.getStatus() != EmailCampaign.CampaignStatus.SENDING) {
            throw new IllegalStateException("Apenas campanhas em envio podem ser canceladas.");
        }

        List<EmailQueue> pendingEmails = emailQueueRepository.findByCampaignIdAndStatus(id,
                EmailQueue.EmailStatus.PENDING);
        for (EmailQueue q : pendingEmails) {
            q.setStatus(EmailQueue.EmailStatus.FAILED);
            emailQueueRepository.save(q);
        }

        existing.setStatus(EmailCampaign.CampaignStatus.FAILED);
        campaignRepository.save(existing);
    }

    @Transactional
    public void startCampaign(UUID campaignId) {
        EmailCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campanha não encontrada"));

        if (campaign.getStatus() != EmailCampaign.CampaignStatus.PENDING) {
            throw new IllegalStateException("Apenas campanhas pendentes podem ser iniciadas");
        }

        // Usar o RecipientInfo definido como membro da classe
        List<RecipientInfo> recipients = fetchRecipients(campaign.getAudience());

        campaign.setTotalRecipients(recipients.size());
        campaign.setStatus(EmailCampaign.CampaignStatus.SENDING);
        campaignRepository.save(campaign);

        // Fetch signature if present
        String signatureHtml = "";
        if (campaign.getSignatureId() != null) {
            try {
                EmailSignature sig = signatureService.findById(campaign.getSignatureId());
                signatureHtml = signatureService.generateHtml(sig);
            } catch (Exception e) {
                // Ignore if signature not found, or use a default
            }
        }

        String finalContent = campaign.getContent();
        if (!signatureHtml.isEmpty()) {
            finalContent += "<br><br>" + signatureHtml;
        }

        String frontendUrl = configService.get("FRONTEND_URL", "http://localhost:5173");

        // Enqueue emails
        for (RecipientInfo recipient : recipients) {
            EmailQueue email = new EmailQueue();
            email.setRecipient(recipient.email());
            email.setSubject(campaign.getSubject());

            // Generate Unsubscribe Footer
            String customContent = finalContent;
            if (!"no-token".equals(recipient.token())) {
                String unsubscribeUrl = frontendUrl + "/unsubscribe?token=" + recipient.token();
                String unsubscribeFooter = "<br><hr style=\"border:none;border-top:1px solid #eaeaea;margin:20px 0;\" />"
                        + "<p style=\"font-size:11px;color:#888;text-align:center;font-family:sans-serif;\">"
                        + "Não quer mais receber estes e-mails? "
                        + "<a href=\"" + unsubscribeUrl
                        + "\" style=\"color:#666;text-decoration:underline;\">Clique aqui para cancelar sua inscrição</a>.</p>";
                customContent += unsubscribeFooter;
            }

            email.setContent(customContent);
            email.setCampaignId(campaignId);
            email.setType("CAMPAIGN");
            email.setStatus(EmailQueue.EmailStatus.PENDING);
            emailQueueRepository.save(email);
        }
    }

    public EmailCampaign getCampaignStatus(UUID campaignId) {
        return campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campanha não encontrada"));
    }

    public List<EmailCampaign> listAll() {
        return campaignRepository.findAll();
    }

    private record RecipientInfo(String email, String token) {
    }

    private List<RecipientInfo> fetchRecipients(String audience) {
        if ("NEWSLETTER_SUBSCRIBERS".equals(audience)) {
            return subscriberRepository.findAll().stream()
                    .filter(NewsletterSubscriber::getEmailVerified)
                    .map(sub -> new RecipientInfo(sub.getEmail(), sub.getVerificationToken()))
                    .collect(Collectors.toList());
        } else if ("ALL_CUSTOMERS".equals(audience)) {
            return userRepository.findAll().stream()
                    .filter(u -> "CUSTOMER".equals(u.getRole()) && u.getEmailVerified())
                    .map(u -> new RecipientInfo(u.getEmail(), "no-token"))
                    .collect(Collectors.toList());
        } else if (audience.startsWith("PRODUCT:")) {
            try {
                UUID productId = UUID.fromString(audience.substring(8));
                return productFavoriteRepository.findByProductId(productId).stream()
                        .map(fav -> new RecipientInfo(fav.getUser().getEmail(), "no-token"))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                return List.of();
            }
        }
        return List.of();
    }

    @Transactional
    public void sendManualMessage(String subject, String content, String audience) {
        // Criar uma campanha de sistema para rastreamento
        EmailCampaign systemCampaign = new EmailCampaign();
        systemCampaign.setName("AUTO: " + subject);
        systemCampaign.setSubject(subject);
        systemCampaign.setContent(content);
        systemCampaign.setAudience(audience);
        systemCampaign.setStatus(EmailCampaign.CampaignStatus.SENDING);
        EmailCampaign saved = campaignRepository.save(systemCampaign);

        List<RecipientInfo> recipients = fetchRecipients(audience);
        saved.setTotalRecipients(recipients.size());

        String frontendUrl = configService.get("FRONTEND_URL", "http://localhost:5173");

        for (RecipientInfo recipient : recipients) {
            EmailQueue email = new EmailQueue();
            email.setRecipient(recipient.email());
            email.setSubject(subject);

            String customContent = content;
            if (!"no-token".equals(recipient.token())) {
                String unsubscribeUrl = frontendUrl + "/unsubscribe?token=" + recipient.token();
                customContent += "<br><p style='font-size:11px;color:#888;'>Para sair: <a href='" + unsubscribeUrl
                        + "'>clique aqui</a></p>";
            }

            email.setContent(customContent);
            email.setCampaignId(saved.getId());
            email.setType("AUTOMATION");
            email.setStatus(EmailQueue.EmailStatus.PENDING);
            emailQueueRepository.save(email);
        }
    }
}
