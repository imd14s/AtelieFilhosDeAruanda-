package com.atelie.ecommerce.infrastructure.persistence.payment;

import com.atelie.ecommerce.domain.payment.model.PaymentProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PaymentProviderRepository extends JpaRepository<PaymentProvider, UUID> {
}
