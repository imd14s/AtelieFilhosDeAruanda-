package com.atelie.ecommerce.api.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponse {
    private UUID id;
    private String name;
    private String email;
    private String role;
    private String photoUrl;
    private String googleId;
    private Boolean emailVerified;
    private String document;
}
