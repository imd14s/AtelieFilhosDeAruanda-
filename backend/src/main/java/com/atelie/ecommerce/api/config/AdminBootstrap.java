package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AdminBootstrap
 * Garante que o usuário Admin exista e esteja com a senha sincronizada com o .env.
 * Isso permite rotação de senhas sem tocar no banco de dados manualmente.
 */
@Component
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Obrigatório via env: não há default. Email do único usuário inicial (admin). */
    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    /** Obrigatório via env: senha do admin. Sem valor default. */
    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            System.out.println("⚠️ ADMIN_EMAIL e ADMIN_PASSWORD devem ser configurados via variáveis de ambiente. Pulando bootstrap de admin.");
            return;
        }

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            existingUser -> {
                // Usuário já existe? Atualiza a senha para garantir sincronia com .env
                // Só atualiza se o hash for diferente (evita update desnecessário, mas aqui forçamos por segurança)
                existingUser.setPassword(passwordEncoder.encode(adminPassword));
                existingUser.setRole("ADMIN"); // Garante permissão
                userRepository.save(existingUser);
                System.out.println("🔒 Admin User ('" + adminEmail + "') atualizado com a senha do ambiente.");
            },
            () -> {
                // Não existe? Cria novo.
                UserEntity newAdmin = UserEntity.builder()
                        .id(UUID.randomUUID())
                        .name("Admin Master")
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .role("ADMIN")
                        .createdAt(LocalDateTime.now())
                        .build(); // Usando Builder do Lombok se disponível, ou construtor padrão
                
                // Fallback se o Builder não estiver ativo no Entity
                if (newAdmin.getName() == null) {
                    newAdmin = new UserEntity("Admin Master", adminEmail, passwordEncoder.encode(adminPassword), "ADMIN");
                }
                
                userRepository.save(newAdmin);
                System.out.println("✨ Admin User ('" + adminEmail + "') criado com sucesso.");
            }
        );
    }
}
