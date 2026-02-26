package com.atelie.ecommerce.application.dto.auth;

import lombok.*;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private UUID id;
    private String name;
    private String email;
    private String role;
    private boolean emailVerified;
    private String photoUrl;
    private String googleId;

    // Construtor preventivo: permite criar apenas com o token sem quebrar o
    // Controller
    public LoginResponse(String token) {
        this.token = token;
    }

    public String getAccessToken() {
        return token;
    }
}
