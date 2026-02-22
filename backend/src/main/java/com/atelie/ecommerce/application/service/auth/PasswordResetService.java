package com.atelie.ecommerce.application.service.auth;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.application.service.marketing.CommunicationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.atelie.ecommerce.api.config.DynamicConfigService;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final CommunicationService communicationService;
    private final PasswordEncoder passwordEncoder;
    private final DynamicConfigService configService;

    public PasswordResetService(UserRepository userRepository,
            CommunicationService communicationService,
            PasswordEncoder passwordEncoder,
            DynamicConfigService configService) {
        this.userRepository = userRepository;
        this.communicationService = communicationService;
        this.passwordEncoder = passwordEncoder;
        this.configService = configService;
    }

    @Transactional
    public void requestReset(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiresAt(LocalDateTime.now().plusHours(2));
        userRepository.save(user);

        String frontendUrl = configService.requireString("FRONTEND_URL");
        String resetLink = frontendUrl + "/redefinir-senha?token=" + token;

        communicationService.sendAutomation(
                AutomationType.PASSWORD_RESET,
                email,
                Map.of("token", token, "reset_link", resetLink, "name", user.getName()));
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        UserEntity user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou expirado."));

        if (user.getResetPasswordExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expirado.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        userRepository.save(user);
    }
}
