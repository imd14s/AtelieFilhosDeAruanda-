package com.atelie.ecommerce.api.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Payload enviado pelo frontend (Google Identity Services
 * via @react-oauth/google).
 * O frontend autentica via Google, busca o userInfo e envia os dados para o
 * backend.
 */
public class GoogleLoginRequest {

    /** Access token OAuth2 do Google (para validação opcional via tokeninfo) */
    @JsonProperty("accessToken")
    private String accessToken;

    /** E-mail verificado do usuário (obtido via /oauth2/v3/userinfo) */
    @JsonProperty("email")
    private String email;

    /** Nome completo do usuário */
    @JsonProperty("name")
    private String name;

    /** URL da foto de perfil */
    @JsonProperty("picture")
    private String picture;

    /** ID único do Google (sub field) */
    @JsonProperty("googleId")
    private String googleId;

    /** Compatibilidade retroativa */
    @JsonProperty("idToken")
    private String idToken;

    public GoogleLoginRequest() {
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    @Override
    public String toString() {
        return "GoogleLoginRequest{email='" + email + "', name='" + name + "', googleId='" + googleId + "'}";
    }
}
