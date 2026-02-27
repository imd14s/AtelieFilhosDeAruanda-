package com.atelie.ecommerce.api.auth;

import com.atelie.ecommerce.application.common.exception.GlobalExceptionHandler;
import com.atelie.ecommerce.application.dto.auth.PasswordResetRequest;
import com.atelie.ecommerce.application.dto.auth.ResetPasswordCommitRequest;
import com.atelie.ecommerce.application.service.auth.PasswordResetService;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PasswordResetController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
public class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PasswordResetService passwordResetService;

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
    @DisplayName("POST /request - Should return 200")
    void requestReset_ValidRequest_ShouldReturn200() throws Exception {
        PasswordResetRequest request = new PasswordResetRequest();
        request.setEmail("user@example.com");

        willDoNothing().given(passwordResetService).requestReset(anyString());

        mockMvc.perform(post("/api/auth/password-reset/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /reset - Should return 200")
    void resetPassword_ValidRequest_ShouldReturn200() throws Exception {
        ResetPasswordCommitRequest request = new ResetPasswordCommitRequest();
        request.setToken("valid-token");
        request.setNewPassword("new-password123");

        willDoNothing().given(passwordResetService).resetPassword(anyString(), anyString());

        mockMvc.perform(post("/api/auth/password-reset/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /request - Should return 400 when email is invalid")
    void requestReset_InvalidEmail_ShouldReturn400() throws Exception {
        PasswordResetRequest request = new PasswordResetRequest();
        request.setEmail("invalid-email");

        mockMvc.perform(post("/api/auth/password-reset/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validação Falhou"));
    }
}
