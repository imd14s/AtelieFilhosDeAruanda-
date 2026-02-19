package com.atelie.ecommerce.application.service.auth;

import com.atelie.ecommerce.api.auth.dto.LoginRequest;
import com.atelie.ecommerce.api.auth.dto.RegisterRequest;
import com.atelie.ecommerce.api.admin.dto.CreateUserDTO;
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

    private final com.atelie.ecommerce.application.service.audit.AuditService auditService;

    public AuthService(AuthenticationManager authenticationManager,
            TokenProvider tokenProvider,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            com.atelie.ecommerce.application.service.audit.AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public String login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = tokenProvider.generateToken(auth);

        // Audit logic could strictly fail if user details are missing, but here we
        // expect them present
        try {
            // We need to manually set the context because the request thread (controller)
            // might not have it populated from the token yet (since we just generated it).
            // Actually, 'auth' variable HAS the principal.
            // But AuditService looks at SecurityContextHolder.
            // So we set it temporarily or pass info to AuditService.
            // Ideally AuditService should accept 'UserPrincipal' as argument too.
            // But for now, let's just set the security context if it's empty, or just rely
            // on 'auth' being passed?
            // No, AuditService.log() gets from Context.
            // Let's set context momentarily.
            SecurityContextHolder.getContext().setAuthentication(auth);
            auditService.log(
                    com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.LOGIN,
                    com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.USER,
                    request.getEmail(), // Resource ID is email for login
                    "Login realizado com sucesso via email/senha");
        } catch (Exception e) {
            // Do not fail login if audit fails
            System.err.println("Failed to audit login: " + e.getMessage());
        }

        return token;
    }

    @Transactional
    public void registerCustomer(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("E-mail já cadastrado.");
        }

        String code = String.valueOf((int) (Math.random() * 900000) + 100000); // 6 digits

        UserEntity newUser = new UserEntity(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                "CUSTOMER");
        newUser.setActive(false);
        newUser.setEmailVerified(false);
        newUser.setVerificationCode(code);

        userRepository.save(newUser);

        // Simulating Email Sending
        System.out.println(">>> EMAIL SIMULATOR: Send verification code " + code + " to " + request.getEmail());
    }

    @Transactional
    public String verifyCustomer(com.atelie.ecommerce.api.auth.dto.VerifyRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new com.atelie.ecommerce.api.common.exception.NotFoundException(
                        "Usuário não encontrado."));

        if (!request.getCode().equals(user.getVerificationCode())) {
            throw new IllegalArgumentException("Código inválido.");
        }

        user.setEmailVerified(true);
        user.setActive(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        // Auto-login logic could be here, but for now we return a token
        Authentication auth = new UsernamePasswordAuthenticationToken(user.getEmail(), null,
                java.util.Collections.emptyList());
        // Note: For full auto-login we might need to bypass password check or use a
        // special token generation
        // For simplicity, let's just return "Verified" and force user to login, or
        // generate token if we can construct UserDetails

        return "Conta verificada com sucesso.";
    }

    @Transactional
    public String googleLogin(com.atelie.ecommerce.api.auth.dto.GoogleLoginRequest request) {
        // MOCK Implementation for Google Verify
        // In production: GoogleIdTokenVerifier verifier = ...
        String email = "google_user_" + request.getIdToken().substring(0, 5) + "@gmail.com";
        String name = "Google User";

        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new UserEntity(name, email, passwordEncoder.encode("GOOGLE_AUTH_" + java.util.UUID.randomUUID()),
                    "CUSTOMER");
            user.setEmailVerified(true);
            user.setActive(true);
            userRepository.save(user);
        }

        // Generate Token (Forced, as we trust Google)
        // We need a way to generate token without password auth if using standard
        // TokenProvider
        // Assuming TokenProvider can take an Authentication object. We create a
        // pre-authenticated one.
        // This might require changes in TokenProvider or custom logic.
        // For this task: We will just return a placeholder or need to refactor login.
        // Simplification: We generated a random password. We can't use
        // authenticationManager.authenticate easily.
        // We will construct a lightweight Authentication object.
        return tokenProvider
                .generateToken(new UsernamePasswordAuthenticationToken(email, null, java.util.Collections.emptyList()));
    }

    @Transactional
    public void createEmployee(com.atelie.ecommerce.api.admin.dto.CreateUserDTO request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Double check admin just in case
        boolean isAdmin = auth != null
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin)
            throw new AccessDeniedException("Acesso negado.");

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("E-mail já cadastrado.");
        }

        String role = request.getRole() != null ? request.getRole() : "EMPLOYEE";

        UserEntity newUser = new UserEntity(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role);
        newUser.setEmailVerified(true);
        newUser.setActive(true);

        userRepository.save(newUser);
    }

    /**
     * Legacy register (kept for compatibility if needed, using old logic but
     * refined)
     */
    @Transactional
    public void register(RegisterRequest request) {
        // Redirect to customer register if no auth (Public)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            // Admin creating generic user?
            // Map to createEmployee logic or just old logic
            CreateUserDTO dto = new CreateUserDTO(request.getName(), request.getEmail(), request.getPassword(),
                    request.getRole());
            createEmployee(dto);
        } else {
            registerCustomer(request);
        }
    }
}
