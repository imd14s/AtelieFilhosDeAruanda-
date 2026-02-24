package com.atelie.ecommerce.api.user;

import com.atelie.ecommerce.api.user.dto.UserProfileResponse;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/profile")
public class UserProfileController {

    private final UserRepository userRepository;

    public UserProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        UserEntity user = userRepository.findById(UUID.fromString(principal.getId()))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return ResponseEntity.ok(UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .photoUrl(user.getPhotoUrl())
                .googleId(user.getGoogleId())
                .emailVerified(user.getEmailVerified())
                .build());
    }

    @PatchMapping("/photo")
    public ResponseEntity<Void> updatePhoto(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> payload) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String photoUrl = payload.get("photoUrl");
        UserEntity user = userRepository.findById(UUID.fromString(principal.getId()))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        user.setPhotoUrl(photoUrl);
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}
