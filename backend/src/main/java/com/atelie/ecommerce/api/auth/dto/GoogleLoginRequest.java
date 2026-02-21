package com.atelie.ecommerce.api.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Payload enviado pelo frontend (Google Identity Services
 * via @react-oauth/google).
 * Não usa mais Firebase — o frontend busca o userInfo diretamente do Google
 * e envia os dados junto com o accessToken para o backend validar.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {

    /** Access token OAuth2 emitido pelo Google (para validação via tokeninfo) */
    private String accessToken;

    /** E-mail do usuário (obtido pelo frontend via /oauth2/v3/userinfo) */
    private String email;

    /** Nome completo do usuário */
    private String name;

    /** URL da foto de perfil */
    private String picture;

    /** ID único do Google (sub field do userinfo) */
    private String googleId;

    // --- Compatibilidade retroativa: ainda aceita idToken se existir ---
    private String idToken;
}
