package com.atelie.ecommerce.infrastructure.security;

import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // CORREÇÃO: Converte a role do banco (ex: "ADMIN") para Authority
        // ("ROLE_ADMIN")
        String roleName = user.getRole() == null ? "USER" : user.getRole().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        return UserPrincipal.create(user);
    }
}
