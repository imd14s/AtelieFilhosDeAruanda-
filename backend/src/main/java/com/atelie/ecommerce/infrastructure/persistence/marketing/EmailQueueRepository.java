package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailQueueRepository extends JpaRepository<EmailQueue, UUID> {

    @Query("SELECT e FROM EmailQueue e WHERE e.status = 'PENDING' AND e.scheduledAt <= :now ORDER BY e.priority DESC, e.scheduledAt ASC")
    List<EmailQueue> findPendingEmails(LocalDateTime now);

    long countByStatusAndSentAtAfter(EmailQueue.EmailStatus status, LocalDateTime startOfDay);

    long countByCampaignIdAndStatus(UUID campaignId, EmailQueue.EmailStatus status);
}
