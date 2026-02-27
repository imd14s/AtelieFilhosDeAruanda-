package com.atelie.ecommerce.application.service.auth;

import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import com.atelie.ecommerce.application.service.marketing.CommunicationService;
import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunicationService communicationService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private DynamicConfigService configService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private UserEntity user;
    private final String email = "test@example.com";

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setEmail(email);
        user.setName("Test User");
    }

    @Test
    void requestReset_Success() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(configService.requireString("FRONTEND_URL")).thenReturn("http://localhost:3000");

        passwordResetService.requestReset(email);

        assertNotNull(user.getResetPasswordToken());
        assertNotNull(user.getResetPasswordExpiresAt());
        verify(userRepository).save(user);
        verify(communicationService).sendAutomation(
                eq(AutomationType.PASSWORD_RESET),
                eq(email),
                anyMap()
        );
    }

    @Test
    void requestReset_UserNotFound_ShouldThrowException() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> passwordResetService.requestReset(email));
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_Success() {
        String token = "valid-token";
        String newPassword = "new-password";
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiresAt(LocalDateTime.now().plusHours(1));

        when(userRepository.findByResetPasswordToken(token)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(newPassword)).thenReturn("encoded-password");

        passwordResetService.resetPassword(token, newPassword);

        assertEquals("encoded-password", user.getPassword());
        assertNull(user.getResetPasswordToken());
        assertNull(user.getResetPasswordExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void resetPassword_InvalidToken_ShouldThrowException() {
        when(userRepository.findByResetPasswordToken("invalid")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> passwordResetService.resetPassword("invalid", "pass"));
    }

    @Test
    void resetPassword_ExpiredToken_ShouldThrowException() {
        String token = "expired-token";
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByResetPasswordToken(token)).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordResetService.resetPassword(token, "pass"));
        assertEquals("Token expirado.", ex.getMessage());
    }
}
