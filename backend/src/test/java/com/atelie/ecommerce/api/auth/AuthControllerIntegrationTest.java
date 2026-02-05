package com.atelie.ecommerce.api.auth;

import com.atelie.ecommerce.api.auth.dto.LoginRequest;
import com.atelie.ecommerce.api.auth.dto.RegisterRequest;
import com.atelie.ecommerce.application.service.auth.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void login_ValidCredentials_ShouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "password");

        given(authService.login(any(LoginRequest.class))).willReturn("mock-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));
    }

    @Test
    void login_InvalidCredentials_ShouldReturnUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("wrong@example.com", "wrongpass");

        // Simulating standard Spring Security behaviors
        given(authService.login(any(LoginRequest.class)))
                .willThrow(new BadCredentialsException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
        // Note: Standard handling or GlobalExceptionHandler should map this to 401
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void register_AsAdmin_ShouldSucceed() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("new@example.com");
        request.setPassword("password");
        request.setRole("USER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "USER") // Not ADMIN, so logic inside service (which checks SecurityContext) or
                                  // PreAuthorize would fail
    void register_AsUser_ShouldReturnForbiddenOrAuthorizedDependingOnLayer() throws Exception {
        // Since logic is inside service:
        // "auth.getAuthorities()...anyMatch...ROLE_ADMIN"
        // And we mock service?
        // WAIT: If we MOCK the service, the service logic is NOT executed.
        // So the security check INSIDE AuthService.register() won't happen if we just
        // do "willDoNothing".
        // BUT, if the controller has security annotations, those would check.
        // AuthController.register() is public in terms of HTTP security?
        // Let's assume the security config allows authenticated access or restricted to
        // ADMIN.
        // If the restriction is ONLY inside the service method (as seen in the
        // reading), then mocking the service bypasses the check?
        // Actually, if we mock the service, we can't test the security logic INSIDE the
        // service.
        // HOWEVER, if the logic is: "Service check SecurityContext", and we Mock the
        // Service...
        // We should skip this test OR use @SpyBean or invoke the real service if we
        // want to test THAT interaction.
        // But this is a Controller test.

        // Let's stick to testing the endpoint response codes assuming the Service
        // throws AccessDeniedException if unauthorized.

        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("new@example.com");
        request.setPassword("password");

        // Simulate Service throwing AccessDenied (mimicking the real service behavior)
        willThrow(new org.springframework.security.access.AccessDeniedException("Apenas administradores..."))
                .given(authService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden()); // or isUnauthorized? Usually AccessDenied -> 403 Forbidden
    }
}
