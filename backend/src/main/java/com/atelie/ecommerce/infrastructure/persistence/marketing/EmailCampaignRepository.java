package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailCampaignRepository extends JpaRepository<EmailCampaign, UUID> {
    List<EmailCampaign> findByStatus(EmailCampaign.CampaignStatus status);
}
