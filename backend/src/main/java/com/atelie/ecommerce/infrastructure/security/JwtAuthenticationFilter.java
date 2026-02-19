package com.atelie.ecommerce.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final Environment env;

    public JwtAuthenticationFilter(TokenProvider tokenProvider,
            CustomUserDetailsService userDetailsService,
            Environment env) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
        this.env = env;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        String username;
        try {
            username = tokenProvider.getUsernameFromToken(token);
        } catch (Exception e) {
            logger.warn("Invalid JWT: " + e.getMessage());
            chain.doFilter(request, response);
            return;
        }

        if (username == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            chain.doFilter(request, response);
            return;
        }

        boolean useClaimRoles = Boolean.parseBoolean(env.getProperty("JWT_USE_CLAIM_ROLES", "true"));

        try {
            if (useClaimRoles) {
                List<String> roles = tokenProvider.getRolesFromToken(token);

                // Só aplica stateless se o token realmente tiver roles
                if (!roles.isEmpty() && tokenProvider.validateTokenBasic(token)) {
                    var authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .toList();

                    String uid = tokenProvider.getClaimFromToken(token, claims -> claims.get("uid", String.class));
                    String name = tokenProvider.getClaimFromToken(token, claims -> claims.get("name", String.class));

                    UserDetails principal;
                    if (uid != null && name != null) {
                        principal = UserPrincipal.create(uid, name, username, authorities);
                    } else {
                        principal = new org.springframework.security.core.userdetails.User(username, "", authorities);
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(principal,
                            null, authorities);

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    chain.doFilter(request, response);
                    return;
                }
            }

            // Fallback: modo antigo (depende de UserDetails/DB)
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (tokenProvider.validateTokenWithUserDetails(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
                        null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (Exception e) {
            logger.error("JWT validation failed", e);
        }

        chain.doFilter(request, response);
    }
}
