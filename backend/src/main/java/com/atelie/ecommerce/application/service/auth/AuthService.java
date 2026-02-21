package com.atelie.ecommerce.application.service.auth;

import com.atelie.ecommerce.api.auth.dto.LoginRequest;
import com.atelie.ecommerce.api.auth.dto.RegisterRequest;
import com.atelie.ecommerce.api.auth.dto.GoogleLoginRequest;
import com.atelie.ecommerce.api.admin.dto.CreateUserDTO;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.security.TokenProvider;
import com.atelie.ecommerce.infrastructure.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailQueueRepository emailQueueRepository;

    private final com.atelie.ecommerce.application.service.audit.AuditService auditService;

    public AuthService(AuthenticationManager authenticationManager,
            TokenProvider tokenProvider,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            EmailQueueRepository emailQueueRepository,
            com.atelie.ecommerce.application.service.audit.AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.emailQueueRepository = emailQueueRepository;
        this.auditService = auditService;
    }

    public String login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new com.atelie.ecommerce.api.common.exception.NotFoundException(
                        "Usuário não encontrado."));

        if (!user.getEmailVerified()) {
            throw new com.atelie.ecommerce.api.common.exception.BusinessException(
                    "Por favor, verifique seu e-mail antes de realizar o login.");
        }

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = tokenProvider.generateToken(auth);

        try {
            SecurityContextHolder.getContext().setAuthentication(auth);
            auditService.log(
                    com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.LOGIN,
                    com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.USER,
                    request.getEmail(),
                    "Login realizado com sucesso via email/senha");
        } catch (Exception e) {
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

        // REAL Email Queue sending
        EmailQueue email = new EmailQueue();
        email.setRecipient(request.getEmail());
        email.setSubject("Verifique seu e-mail - Ateliê Filhos de Aruanda");
        email.setContent("<h1>Bem-vindo!</h1><p>Seu código de verificação é: <strong>" + code + "</strong></p>");
        email.setType("VERIFICATION");
        email.setPriority(EmailQueue.EmailPriority.HIGH);
        emailQueueRepository.save(email);
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
    public String googleLogin(GoogleLoginRequest request) {
        // Log para diagnóstico
        System.out.println("[AuthService] Google Login recebido: " + request);

        // Prioridade: usa os dados já validados pelo frontend via Google /userinfo
        String email = request.getEmail();
        String name = request.getName();

        // Fallback secundário: tenta validar via tokeninfo do Google (opcional)
        if ((email == null || email.isBlank()) && request.getAccessToken() != null) {
            try {
                RestTemplate rest = new RestTemplate();
                String url = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + request.getAccessToken();
                @SuppressWarnings("unchecked")
                ResponseEntity<Map> resp = rest.getForEntity(url, Map.class);
                if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                    email = (String) resp.getBody().get("email");
                    if (name == null)
                        name = (String) resp.getBody().get("name");
                }
            } catch (Exception e) {
                System.err.println("[AuthService] Falha ao chamar tokeninfo: " + e.getMessage());
            }
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email Google não informado. Verifique o payload enviado.");
        }

        final String resolvedEmail = email;
        final String resolvedName = name != null ? name : "Usuário Google";

        // Busca ou cria o usuário por e-mail
        UserEntity user = userRepository.findByEmail(resolvedEmail).orElseGet(() -> {
            UserEntity newUser = new UserEntity(
                    resolvedName,
                    resolvedEmail,
                    passwordEncoder.encode("GOOGLE_OAUTH_" + UUID.randomUUID()),
                    "CUSTOMER");
            newUser.setEmailVerified(true);
            newUser.setActive(true);
            return userRepository.save(newUser);
        });

        // Atualiza o nome se mudou no Google
        if (name != null && !name.equals(user.getName())) {
            user.setName(name);
            userRepository.save(user);
        }

        // Gera JWT do sistema usando UserPrincipal (TokenProvider espera UserDetails,
        // não String)
        UserPrincipal principal = UserPrincipal.create(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
        return tokenProvider.generateToken(auth);
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
