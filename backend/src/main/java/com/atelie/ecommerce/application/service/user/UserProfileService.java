package com.atelie.ecommerce.application.service.user;

import com.atelie.ecommerce.api.common.exception.BusinessException;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.api.user.dto.ChangePasswordRequest;
import com.atelie.ecommerce.application.service.marketing.CommunicationService;
import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CommunicationService communicationService;

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("A nova senha e a confirmação não coincidem.");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("A senha atual está incorreta.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Disparar e-mail de notificação
        communicationService.sendAutomation(
                AutomationType.PASSWORD_CHANGE,
                user.getEmail(),
                Map.of("name", user.getName())
        );
    }
}
