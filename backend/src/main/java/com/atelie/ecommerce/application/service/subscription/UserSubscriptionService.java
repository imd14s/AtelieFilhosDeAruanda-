package com.atelie.ecommerce.application.service.subscription;

import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.application.dto.subscription.SubscriptionRequestDTO;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.customer.repository.UserAddressRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionEntity;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionItemEntity;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionPlanEntity;
import com.atelie.ecommerce.infrastructure.persistence.subscription.repository.SubscriptionPlanRepository;
import com.atelie.ecommerce.infrastructure.persistence.subscription.repository.SubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserSubscriptionService {

        private static final Logger log = LoggerFactory.getLogger(UserSubscriptionService.class);

        private final SubscriptionRepository subscriptionRepository;
        private final SubscriptionPlanRepository planRepository;
        private final UserRepository userRepository;
        private final ProductRepository productRepository;
        private final UserAddressRepository addressRepository;

        public UserSubscriptionService(SubscriptionRepository subscriptionRepository,
                        SubscriptionPlanRepository planRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        UserAddressRepository addressRepository) {
                this.subscriptionRepository = subscriptionRepository;
                this.planRepository = planRepository;
                this.userRepository = userRepository;
                this.productRepository = productRepository;
                this.addressRepository = addressRepository;
        }

        public List<SubscriptionEntity> getUserSubscriptions(UUID userId) {
                return subscriptionRepository.findByUserId(userId);
        }

        @Transactional
        public SubscriptionEntity createSubscription(UUID userId, SubscriptionRequestDTO request) {
                var user = userRepository.findById(userId)
                                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

                var plan = planRepository.findById(request.planId())
                                .orElseThrow(() -> new NotFoundException("Plano não encontrado"));

                var frequencyRule = plan.getFrequencyRules().stream()
                                .filter(r -> r.getFrequency().equals(request.frequency()))
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException("Freqüência inválida para este plano"));

                var address = request.shippingAddressId() != null
                                ? addressRepository.findById(request.shippingAddressId()).orElse(null)
                                : null;

                SubscriptionEntity subscription = SubscriptionEntity.builder()
                                .user(user)
                                .plan(plan)
                                .frequency(request.frequency())
                                .status("ACTIVE")
                                .totalPrice(plan.getBasePrice()) // Simplificado: usa o preço base do plano
                                .cardToken(request.cardToken())
                                .shippingAddress(address)
                                .nextBillingAt(LocalDateTime.now()
                                                .plusWeeks(request.frequency().equals("WEEKLY") ? 1 : 4)) // Mock
                                                                                                          // logic
                                .build();

                if (request.items() != null && !request.items().isEmpty()) {
                        List<SubscriptionItemEntity> items = request.items().stream()
                                        .map(itemReq -> {
                                                var product = productRepository.findById(itemReq.productId())
                                                                .orElseThrow(
                                                                                () -> new NotFoundException(
                                                                                                "Produto não encontrado: "
                                                                                                                + itemReq.productId()));
                                                return SubscriptionItemEntity.builder()
                                                                .subscription(subscription)
                                                                .product(product)
                                                                .quantity(itemReq.quantity())
                                                                .unitPrice(product.getPrice())
                                                                .build();
                                        })
                                        .collect(Collectors.toList());
                        subscription.setItems(items);
                }

                return subscriptionRepository.save(subscription);
        }

        @Transactional
        public SubscriptionEntity updateStatus(UUID id, String status) {
                var subscription = subscriptionRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Assinatura não encontrada"));
                subscription.setStatus(status);
                return subscriptionRepository.save(subscription);
        }
}
