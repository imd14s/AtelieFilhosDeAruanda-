package com.atelie.ecommerce.api.auth;

import com.atelie.ecommerce.application.common.exception.GlobalExceptionHandler;
import com.atelie.ecommerce.application.common.exception.UnauthorizedException;
import com.atelie.ecommerce.application.dto.auth.*;
import com.atelie.ecommerce.application.service.auth.AuthService;
import com.atelie.ecommerce.application.service.catalog.SeoMetadataService;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.security.CustomUserDetailsService;
import com.atelie.ecommerce.infrastructure.security.TokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private SeoMetadataService seoMetadataService;

    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private CategoryRepository categoryRepository;

    @MockBean
    private TokenProvider tokenProvider;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /register - Should return 201 when valid")
    void register_ValidRequest_ShouldReturn201() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /register - Should return 400 when invalid DTO")
    void register_InvalidRequest_ShouldReturn400() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("");
        request.setEmail("invalid-email");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validação Falhou"));
    }

    @Test
    @DisplayName("POST /verify - Should return 200")
    void verify_ValidRequest_ShouldReturn200() throws Exception {
        VerifyRequest request = new VerifyRequest();
        request.setEmail("test@example.com");
        request.setCode("123456");
        given(authService.verifyCustomer(any(VerifyRequest.class))).willReturn("Verified");

        mockMvc.perform(post("/api/auth/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Verified"));
    }

    @Test
    @DisplayName("POST /google - Should return 200 and LoginResponse")
    void google_ValidRequest_ShouldReturn200() throws Exception {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("google-token");
        LoginResponse response = LoginResponse.builder().token("jwt-token").build();
        given(authService.googleLogin(any(GoogleLoginRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    @DisplayName("POST /login - Should return 200 and LoginResponse")
    void login_ValidRequest_ShouldReturn200() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "password");
        LoginResponse response = LoginResponse.builder().token("jwt-token").build();
        given(authService.login(any(LoginRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    @DisplayName("POST /login - Should return 401 when service throws UnauthorizedException")
    void login_InvalidCredentials_ShouldReturn401() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "wrong-password");
        given(authService.login(any(LoginRequest.class))).willThrow(new UnauthorizedException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Não Autorizado"));
    }
}
