package com.atelie.ecommerce.infrastructure.security;

import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final String id;
    private final String name;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;

    public UserPrincipal(String id, String name, String email, String password, boolean active,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.active = active;
        this.authorities = authorities;
    }

    public static UserPrincipal create(UserEntity user) {
        String roleName = user.getRole() == null ? "USER" : user.getRole().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        return new UserPrincipal(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                Boolean.TRUE.equals(user.getActive()),
                List.of(new SimpleGrantedAuthority(roleName)));
    }

    public static UserPrincipal create(String id, String name, String email,
            Collection<? extends GrantedAuthority> authorities) {
        return new UserPrincipal(id, name, email, null, true, authorities);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
