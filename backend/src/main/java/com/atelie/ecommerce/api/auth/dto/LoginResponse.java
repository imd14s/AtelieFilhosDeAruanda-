package com.atelie.ecommerce.api.auth.dto;

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

    // Construtor preventivo: permite criar apenas com o token sem quebrar o
    // Controller
    public LoginResponse(String token) {
        this.token = token;
    }

    public String getAccessToken() {
        return token;
    }
}
