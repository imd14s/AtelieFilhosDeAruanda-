package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmailConfigRepository extends JpaRepository<EmailConfig, UUID> {
    // Como teremos apenas uma configuração ativa, podemos usar findAll().get(0) ou
    // similar
}
