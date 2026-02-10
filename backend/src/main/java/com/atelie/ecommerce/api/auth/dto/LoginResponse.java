package com.atelie.ecommerce.api.auth.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String name;
    private String email;

    // Construtor preventivo: permite criar apenas com o token sem quebrar o
    // Controller
    public LoginResponse(String token) {
        this.token = token;
    }

    public String getAccessToken() {
        return token;
    }
}
