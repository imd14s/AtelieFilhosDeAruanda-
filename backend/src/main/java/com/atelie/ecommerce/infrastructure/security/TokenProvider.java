package com.atelie.ecommerce.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class TokenProvider {

    @Value("${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secret;

    // ENV: JWT_EXPIRATION_MS (ex: 86400000)
    @Value("${JWT_EXPIRATION_MS:86400000}")
    private long expirationMs;

    // ENV: JWT_ROLES_CLAIM (default "roles")
    @Value("${JWT_ROLES_CLAIM:roles}")
    private String rolesClaim;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        var builder = Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .claim(rolesClaim, roles);

        if (userPrincipal instanceof UserPrincipal up) {
            builder.claim("uid", up.getId());
            builder.claim("name", up.getName());
        }

        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public List<String> getRolesFromToken(String token) {
        Claims claims = getAllClaims(token);
        Object raw = claims.get(rolesClaim);

        if (raw == null)
            return List.of();

        if (raw instanceof List<?>) {
            return ((List<?>) raw).stream().map(String::valueOf).toList();
        }

        // fallback seguro (se vier string única)
        return List.of(String.valueOf(raw));
    }

    public boolean validateTokenBasic(String token) {
        // parse valida assinatura; expiração validamos abaixo
        getAllClaims(token);
        return !isTokenExpired(token);
    }

    public boolean validateTokenWithUserDetails(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        final Date expiration = getClaimFromToken(token, Claims::getExpiration);
        return expiration.before(new Date());
    }
}
