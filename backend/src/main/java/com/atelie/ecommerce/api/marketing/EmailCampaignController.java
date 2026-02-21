package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.application.service.marketing.EmailCampaignService;
import com.atelie.ecommerce.domain.marketing.model.EmailCampaign;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketing/campaigns")
public class EmailCampaignController {

    private final EmailCampaignService campaignService;

    public EmailCampaignController(EmailCampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    public ResponseEntity<EmailCampaign> createCampaign(@RequestBody EmailCampaign campaign) {
        return ResponseEntity.ok(campaignService.createCampaign(campaign));
    }

    @GetMapping
    public ResponseEntity<List<EmailCampaign>> listAll() {
        return ResponseEntity.ok(campaignService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailCampaign> getStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(campaignService.getCampaignStatus(id));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startCampaign(@PathVariable UUID id) {
        campaignService.startCampaign(id);
        return ResponseEntity.ok().build();
    }
}
