package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailCampaign;
import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.domain.marketing.model.EmailSignature;
import com.atelie.ecommerce.domain.marketing.model.NewsletterSubscriber;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailCampaignRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.NewsletterSubscriberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmailCampaignService {

    private final EmailCampaignRepository campaignRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final NewsletterSubscriberRepository subscriberRepository;
    private final UserRepository userRepository;
    private final EmailSignatureService signatureService;

    public EmailCampaignService(EmailCampaignRepository campaignRepository,
            EmailQueueRepository emailQueueRepository,
            NewsletterSubscriberRepository subscriberRepository,
            UserRepository userRepository,
            EmailSignatureService signatureService) {
        this.campaignRepository = campaignRepository;
        this.emailQueueRepository = emailQueueRepository;
        this.subscriberRepository = subscriberRepository;
        this.userRepository = userRepository;
        this.signatureService = signatureService;
    }

    @Transactional
    public EmailCampaign createCampaign(EmailCampaign campaign) {
        return campaignRepository.save(campaign);
    }

    @Transactional
    public void startCampaign(UUID campaignId) {
        EmailCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campanha não encontrada"));

        if (campaign.getStatus() != EmailCampaign.CampaignStatus.PENDING) {
            throw new IllegalStateException("Apenas campanhas pendentes podem ser iniciadas");
        }

        List<String> recipients;
        if ("NEWSLETTER_SUBSCRIBERS".equals(campaign.getAudience())) {
            recipients = subscriberRepository.findAll().stream()
                    .filter(NewsletterSubscriber::getEmailVerified)
                    .map(NewsletterSubscriber::getEmail)
                    .collect(Collectors.toList());
        } else if ("ALL_CUSTOMERS".equals(campaign.getAudience())) {
            recipients = userRepository.findAll().stream()
                    .filter(u -> "CUSTOMER".equals(u.getRole()) && u.getEmailVerified())
                    .map(com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity::getEmail)
                    .collect(Collectors.toList());
        } else {
            // Default to test or small audience
            recipients = List.of();
        }

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

        // Enqueue emails
        for (String recipient : recipients) {
            EmailQueue email = new EmailQueue();
            email.setRecipient(recipient);
            email.setSubject(campaign.getSubject());
            email.setContent(finalContent);
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
}
