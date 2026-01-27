package com.atelie.ecommerce.application.service.auth;

import com.atelie.ecommerce.api.auth.dto.LoginRequest;
import com.atelie.ecommerce.api.auth.dto.LoginResponse;
import com.atelie.ecommerce.api.auth.dto.RegisterRequest;
import com.atelie.ecommerce.api.auth.dto.RegisterResponse;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.UnauthorizedException;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.security.TokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       TokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        // Criptografa a senha antes de salvar
        String encryptedPassword = passwordEncoder.encode(request.password());
        
        UserEntity newUser = new UserEntity(request.name(), request.email(), encryptedPassword);
        userRepository.save(newUser);

        return new RegisterResponse(newUser.getId(), newUser.getName(), newUser.getEmail());
    }

    public LoginResponse login(LoginRequest request) {
        try {
            // 1. Tenta autenticar via Spring Security (verifica senha hash)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );

            // 2. Se passar, gera o Token
            String token = tokenProvider.generateToken(authentication);
            
            // 3. Busca dados do usuário para retorno
            UserEntity user = userRepository.findByEmail(request.email()).orElseThrow();

            return new LoginResponse(token, user.getName(), user.getEmail());
            
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid credentials");
        }
    }
}
