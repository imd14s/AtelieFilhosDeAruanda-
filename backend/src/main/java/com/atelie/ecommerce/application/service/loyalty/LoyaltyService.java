package com.atelie.ecommerce.application.service.loyalty;

import com.atelie.ecommerce.application.common.exception.BusinessException;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.entity.WalletEntity;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.entity.WalletTransactionEntity;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.repository.WalletRepository;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public WalletTransactionEntity creditPoints(UUID userId, Integer amount, String reason, UUID referenceId) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive.");
        }

        // Anti-spam: check if this referenceId has already been credited for this exact
        // reason
        boolean exists = walletTransactionRepository.existsByReferenceIdAndTypeAndReason(
                referenceId, WalletTransactionEntity.TransactionType.CREDIT, reason);

        if (exists) {
            throw new BusinessException("Points already credited for this reference.");
        }

        WalletEntity wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserEntity user = userRepository.findById(userId)
                            .orElseThrow(() -> new BusinessException("User not found: " + userId));
                    WalletEntity newWallet = new WalletEntity();
                    newWallet.setUser(user);
                    newWallet.setBalance(0);
                    return walletRepository.save(newWallet);
                });

        wallet.addPoints(amount);
        walletRepository.save(wallet);

        WalletTransactionEntity transaction = new WalletTransactionEntity();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType(WalletTransactionEntity.TransactionType.CREDIT);
        transaction.setReason(reason);
        transaction.setReferenceId(referenceId);

        return walletTransactionRepository.save(transaction);
    }
}
