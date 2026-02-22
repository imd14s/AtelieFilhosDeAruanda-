package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketing/email-queue")
public class EmailQueueController {

    private final EmailQueueRepository repository;

    public EmailQueueController(EmailQueueRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<EmailQueue>> listAll() {
        List<EmailQueue> list = repository.findAll();
        // Ordenar por data de criação decrescente se possível, ou apenas retornar
        Collections.reverse(list);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<EmailQueue> retry(@PathVariable UUID id) {
        return repository.findById(id).map(email -> {
            email.setStatus(EmailQueue.EmailStatus.PENDING);
            email.setRetryCount(0);
            email.setLastError(null);
            email.setScheduledAt(LocalDateTime.now());
            return ResponseEntity.ok(repository.save(email));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/retry-failed")
    public ResponseEntity<Void> retryAllFailed() {
        List<EmailQueue> failed = repository.findAll().stream()
                .filter(e -> e.getStatus() == EmailQueue.EmailStatus.FAILED)
                .toList();

        failed.forEach(email -> {
            email.setStatus(EmailQueue.EmailStatus.PENDING);
            email.setRetryCount(0);
            email.setLastError(null);
            email.setScheduledAt(LocalDateTime.now());
        });

        repository.saveAll(failed);
        return ResponseEntity.ok().build();
    }
}
