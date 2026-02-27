package com.atelie.ecommerce.application.service.loyalty;

import com.atelie.ecommerce.application.common.exception.BusinessException;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.entity.WalletEntity;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.entity.WalletTransactionEntity;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.repository.WalletRepository;
import com.atelie.ecommerce.infrastructure.persistence.loyalty.repository.WalletTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoyaltyServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LoyaltyService loyaltyService;

    private UUID userId;
    private UUID referenceId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        referenceId = UUID.randomUUID();
    }

    @Test
    void creditPoints_ValidRequest_ShouldCreditAndSaveTransaction() {
        // Arrange
        String reason = "Review Approved";
        int amount = 10;
        UserEntity user = new UserEntity();
        user.setId(userId);

        WalletEntity wallet = new WalletEntity();
        wallet.setUser(user);
        wallet.setBalance(0);

        when(walletTransactionRepository.existsByReferenceIdAndTypeAndReason(
                referenceId, WalletTransactionEntity.TransactionType.CREDIT, reason))
                .thenReturn(false);

        when(walletRepository.findByUserId(userId))
                .thenReturn(Optional.of(wallet));

        WalletTransactionEntity savedTransaction = new WalletTransactionEntity();
        savedTransaction.setAmount(amount);
        when(walletTransactionRepository.save(any(WalletTransactionEntity.class))).thenReturn(savedTransaction);

        // Act
        WalletTransactionEntity result = loyaltyService.creditPoints(userId, amount, reason, referenceId);

        // Assert
        assertNotNull(result);
        assertEquals(10, wallet.getBalance(), "Wallet balance should be updated");
        verify(walletRepository, times(1)).save(wallet);

        ArgumentCaptor<WalletTransactionEntity> transactionCaptor = ArgumentCaptor
                .forClass(WalletTransactionEntity.class);
        verify(walletTransactionRepository, times(1)).save(transactionCaptor.capture());

        WalletTransactionEntity capturedTransaction = transactionCaptor.getValue();
        assertEquals(amount, capturedTransaction.getAmount());
        assertEquals(reason, capturedTransaction.getReason());
        assertEquals(referenceId, capturedTransaction.getReferenceId());
        assertEquals(WalletTransactionEntity.TransactionType.CREDIT, capturedTransaction.getType());
    }

    @Test
    void creditPoints_DuplicateRequest_ShouldThrowBusinessException() {
        // Arrange
        String reason = "Review Approved";
        int amount = 10;

        when(walletTransactionRepository.existsByReferenceIdAndTypeAndReason(
                referenceId, WalletTransactionEntity.TransactionType.CREDIT, reason))
                .thenReturn(true);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> loyaltyService.creditPoints(userId, amount, reason, referenceId));

        assertEquals("Points already credited for this reference.", exception.getMessage());
        verify(walletRepository, never()).findByUserId(any(UUID.class));
        verify(walletRepository, never()).save(any(WalletEntity.class));
        verify(walletTransactionRepository, never()).save(any(WalletTransactionEntity.class));
    }
}
