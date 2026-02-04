package com.atelie.ecommerce.application.service.auth;

import com.atelie.ecommerce.api.auth.dto.LoginRequest;
import com.atelie.ecommerce.api.auth.dto.RegisterRequest;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.security.TokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager, 
                       TokenProvider tokenProvider, 
                       PasswordEncoder passwordEncoder,
                       UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public String login(LoginRequest request) {
        // Autentica e gera o token usando o objeto de autenticação completo (mais seguro)
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        return tokenProvider.generateToken(auth);
    }

    /**
     * Cria um novo usuário. Apenas um admin autenticado pode chamar este método.
     * Apenas um admin pode atribuir a role ADMIN ao novo usuário; caso contrário, role será USER.
     */
    @Transactional
    public void register(RegisterRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
            throw new AccessDeniedException("Apenas administradores podem criar usuários.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("E-mail já cadastrado no sistema.");
        }

        String role = "USER";
        if (request.getRole() != null && "ADMIN".equalsIgnoreCase(request.getRole().trim())) {
            role = "ADMIN"; // Só chega aqui se o caller já é admin (verificado acima).
        }

        UserEntity newUser = new UserEntity(
            request.getName(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            role
        );
        userRepository.save(newUser);
    }
}
