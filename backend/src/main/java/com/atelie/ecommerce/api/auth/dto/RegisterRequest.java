package com.atelie.ecommerce.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    /** Role do novo usuário: USER ou ADMIN. Só outro admin pode definir ADMIN. Se omitido, default USER. */
    private String role;
}
