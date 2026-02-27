package com.atelie.ecommerce.application.service.auth;

import com.atelie.ecommerce.application.common.exception.BusinessException;
import com.atelie.ecommerce.application.common.exception.ConflictException;
import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.application.dto.admin.CreateUserDTO;
import com.atelie.ecommerce.application.dto.auth.*;
import com.atelie.ecommerce.application.service.audit.AuditService;
import com.atelie.ecommerce.application.service.marketing.CommunicationService;
import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.security.TokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private TokenProvider tokenProvider;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmailQueueRepository emailQueueRepository;
    @Mock
    private AuditService auditService;
    @Mock
    private CommunicationService communicationService;

    @InjectMocks
    private AuthService authService;

    private UserEntity user;

    @BeforeEach
    void setUp() {
        user = new UserEntity("Test User", "test@example.com", "encoded-pass", "CUSTOMER");
        user.setId(UUID.randomUUID());
        user.setEmailVerified(true);
        SecurityContextHolder.clearContext();
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");
        Authentication auth = mock(Authentication.class);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        verify(auditService).log(any(), any(), any(), any());
    }

    @Test
    void login_UserNotFound_ShouldThrowException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("password");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> authService.login(request));
    }

    @Test
    void login_UnverifiedEmail_ShouldThrowException() {
        user.setEmailVerified(false);
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.login(request));
        assertEquals("Por favor, verifique seu e-mail antes de realizar o login.", ex.getMessage());
    }

    @Test
    void login_AuditLogFailure_ShouldStillSucceed() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");
        Authentication auth = mock(Authentication.class);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("jwt-token");
        doThrow(new RuntimeException("Audit failed")).when(auditService).log(any(), any(), any(), any());

        assertDoesNotThrow(() -> authService.login(request));
    }

    @Test
    void registerCustomer_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("new@example.com");
        request.setPassword("pass");
        request.setDocument("12345678900");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");

        authService.registerCustomer(request);

        verify(userRepository).save(any(UserEntity.class));
        verify(communicationService).sendAutomation(eq(AutomationType.USER_VERIFY), eq(request.getEmail()), anyMap());
    }

    @Test
    void registerCustomer_Conflict_ShouldThrowException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.registerCustomer(request));
    }

    @Test
    void verifyCustomer_Success() {
        VerifyRequest request = new VerifyRequest("test@example.com", "123456");
        user.setVerificationCode("123456");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        String result = authService.verifyCustomer(request);

        assertEquals("Conta verificada com sucesso.", result);
        assertTrue(user.getEmailVerified());
        assertNull(user.getVerificationCode());
        verify(userRepository).save(user);
    }

    @Test
    void verifyCustomer_InvalidCode_ShouldThrowException() {
        VerifyRequest request = new VerifyRequest("test@example.com", "wrong");
        user.setVerificationCode("123456");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> authService.verifyCustomer(request));
    }

    @Test
    void verifyCustomer_UserNotFound_ShouldThrowException() {
        VerifyRequest request = new VerifyRequest("notfound@example.com", "123456");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> authService.verifyCustomer(request));
    }

    @Test
    void googleLogin_Success_CreateUser() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setGoogleId("google-id");
        request.setAccessToken("AccessToken");
        request.setName("Google User");
        request.setEmail("google@example.com");
        request.setPicture("photo-url");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            UserEntity u = invocation.getArgument(0);
            if (u.getId() == null)
                u.setId(UUID.randomUUID());
            return u;
        });
        when(tokenProvider.generateToken(any())).thenReturn("google-jwt");

        LoginResponse response = authService.googleLogin(request);

        assertNotNull(response);
        assertEquals("google-jwt", response.getToken());
        verify(userRepository, atLeastOnce()).save(any());
    }

    @Test
    void googleLogin_Success_ExistingUser_UpdateFields() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setGoogleId("new-google-id");
        request.setName("New Name");
        request.setEmail("test@example.com");
        request.setPicture("new-photo");

        user.setGoogleId("old-google-id");
        user.setName("Old Name");
        user.setPhotoUrl("old-photo");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(any())).thenReturn("google-jwt");

        authService.googleLogin(request);

        assertEquals("New Name", user.getName());
        assertEquals("new-photo", user.getPhotoUrl());
        assertEquals("new-google-id", user.getGoogleId());
        verify(userRepository).save(user);
    }

    @Test
    void googleLogin_NoEmail_ShouldThrowException() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        assertThrows(IllegalArgumentException.class, () -> authService.googleLogin(request));
    }

    @Test
    void googleLogin_WithAccessToken_FallbackToRestTemplate() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setAccessToken("valid-access-token");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) -> {
            Map<String, Object> body = new HashMap<>();
            body.put("email", "fallback@example.com");
            body.put("name", "Fallback User");
            ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);
            when(mock.getForEntity(anyString(), eq(Map.class))).thenReturn(response);
        })) {
            when(userRepository.findByEmail("fallback@example.com")).thenReturn(Optional.of(user));
            when(tokenProvider.generateToken(any())).thenReturn("google-jwt");

            LoginResponse response = authService.googleLogin(request);
            assertEquals("test@example.com", response.getEmail()); // user mocked is 'user' which has 'test@example.com'
        }
    }

    @Test
    void googleLogin_Fallback_Failure() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setAccessToken("invalid-token");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) -> {
            ResponseEntity<Map> response = new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            when(mock.getForEntity(anyString(), eq(Map.class))).thenReturn(response);
        })) {
            assertThrows(IllegalArgumentException.class, () -> authService.googleLogin(request));
        }
    }

    @Test
    void googleLogin_Fallback_Exception() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setAccessToken("error-token");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) -> {
            when(mock.getForEntity(anyString(), eq(Map.class))).thenThrow(new RuntimeException("API error"));
        })) {
            assertThrows(IllegalArgumentException.class, () -> authService.googleLogin(request));
        }
    }

    @Test
    void googleLogin_Fallback_Success_NullBody() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setAccessToken("token");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) -> {
            ResponseEntity<Map> response = new ResponseEntity<>(HttpStatus.OK); // Body is null
            when(mock.getForEntity(anyString(), eq(Map.class))).thenReturn(response);
        })) {
            assertThrows(IllegalArgumentException.class, () -> authService.googleLogin(request));
        }
    }

    @Test
    void googleLogin_BlankEmail_ShouldThrowException() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setEmail("   ");
        assertThrows(IllegalArgumentException.class, () -> authService.googleLogin(request));
    }

    @Test
    void googleLogin_Fallback_BlankEmail_ShouldThrowException() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setAccessToken("token");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) -> {
            Map<String, Object> body = new HashMap<>();
            body.put("email", " ");
            ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);
            when(mock.getForEntity(anyString(), eq(Map.class))).thenReturn(response);
        })) {
            assertThrows(IllegalArgumentException.class, () -> authService.googleLogin(request));
        }
    }

    @Test
    void googleLogin_Success_ExistingUser_NoUpdateNeeded() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setEmail("test@example.com");
        request.setName("Test User");
        user.setPhotoUrl(null);
        user.setGoogleId(null);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(any())).thenReturn("token");

        authService.googleLogin(request);
        verify(userRepository, never()).save(any());
    }

    @Test
    void createEmployee_EmptyAuthorities_ShouldThrowException() {
        Authentication auth = mock(Authentication.class);
        when(auth.getAuthorities()).thenReturn(Collections.emptyList());
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        CreateUserDTO request = new CreateUserDTO();
        request.setEmail("emp@example.com");

        assertThrows(AccessDeniedException.class, () -> authService.createEmployee(request));
    }

    @Test
    void createEmployee_NullAuthentication_ShouldThrowException() {
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        CreateUserDTO request = new CreateUserDTO();
        request.setEmail("emp@example.com");

        assertThrows(AccessDeniedException.class, () -> authService.createEmployee(request));
    }

    @Test
    void googleLogin_Fallback_Success_NullName() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setAccessToken("token");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) -> {
            Map<String, Object> body = new HashMap<>();
            body.put("email", "fallback@example.com");
            body.put("name", null);
            ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);
            when(mock.getForEntity(anyString(), eq(Map.class))).thenReturn(response);
        })) {
            when(userRepository.findByEmail("fallback@example.com")).thenReturn(Optional.of(user));
            when(tokenProvider.generateToken(any())).thenReturn("google-jwt");

            authService.googleLogin(request);
            // Verify resolvedName logic (Resolved name used if user not found,
            // but here user exists, so we check if name was updated to "Usuário Google" if
            // it was different)
            // But wait, user name in setUp is "Test User". resolvedName is "Usuário
            // Google". So it should update.
            assertEquals("Usuário Google", user.getName());
        }
    }

    @Test
    void googleLogin_Success_NoChanges() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setEmail("test@example.com");
        request.setName("Test User");
        request.setPicture("photo-url");
        request.setGoogleId("google-id");

        user.setName("Test User");
        user.setPhotoUrl("photo-url");
        user.setGoogleId("google-id");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(any())).thenReturn("token");

        authService.googleLogin(request);
        verify(userRepository, never()).save(user);
    }

    @Test
    void googleLogin_NullName_ExistingUser_ShouldUpdateToDefault() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setEmail("test@example.com");
        request.setName(null);

        user.setName("Old Name");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(any())).thenReturn("token");

        authService.googleLogin(request);

        assertEquals("Usuário Google", user.getName());
        verify(userRepository).save(user);
    }

    @Test
    void googleLogin_NullName_NewUser_ShouldUseDefault() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setEmail("new@example.com");
        request.setName(null);

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            UserEntity u = invocation.getArgument(0);
            if (u.getId() == null)
                u.setId(UUID.randomUUID());
            return u;
        });
        when(tokenProvider.generateToken(any())).thenReturn("token");

        authService.googleLogin(request);

        verify(userRepository).save(argThat(u -> u.getName().equals("Usuário Google")));
    }

    @Test
    void createEmployee_DefaultRole() {
        mockAdminAuthentication();
        CreateUserDTO request = new CreateUserDTO();
        request.setName("Emp");
        request.setEmail("emp@example.com");
        request.setPassword("pass");
        request.setRole(null);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);

        authService.createEmployee(request);

        verify(userRepository).save(argThat(u -> u.getRole().equals("EMPLOYEE")));
    }

    @Test
    void createEmployee_NonAdmin_ShouldThrowException() {
        mockCustomerAuthentication();
        CreateUserDTO request = new CreateUserDTO("Employee", "emp@example.com", "pass", "EMPLOYEE", "document");

        assertThrows(AccessDeniedException.class, () -> authService.createEmployee(request));
    }

    @Test
    void createEmployee_Conflict_ShouldThrowException() {
        mockAdminAuthentication();
        CreateUserDTO request = new CreateUserDTO("Employee", "test@example.com", "pass", "EMPLOYEE", null);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.createEmployee(request));
    }

    @Test
    void register_AsAdmin_ShouldCreateEmployee() {
        mockAdminAuthentication();
        RegisterRequest request = new RegisterRequest();
        request.setName("Emp");
        request.setEmail("emp@example.com");
        request.setPassword("pass");
        request.setRole("MANAGER");
        request.setDocument("doc");

        when(userRepository.existsByEmail(any())).thenReturn(false);

        authService.register(request);

        verify(userRepository).save(argThat(u -> u.getRole().equals("MANAGER")));
    }

    @Test
    void register_AsCustomer_ShouldRegisterCustomer() {
        // No authentication (SecurityContextHolder is clear)
        RegisterRequest request = new RegisterRequest();
        request.setName("Cust");
        request.setEmail("cust@example.com");
        request.setPassword("pass");

        when(userRepository.existsByEmail(any())).thenReturn(false);

        authService.register(request);

        verify(userRepository).save(argThat(u -> u.getRole().equals("CUSTOMER") && !u.getEmailVerified()));
    }

    @Test
    void register_AsNonAdmin_ShouldRegisterCustomer() {
        mockCustomerAuthentication();
        RegisterRequest request = new RegisterRequest();
        request.setName("Cust");
        request.setEmail("cust@example.com");
        request.setPassword("pass");

        when(userRepository.existsByEmail(any())).thenReturn(false);

        authService.register(request);

        verify(userRepository).save(argThat(u -> u.getRole().equals("CUSTOMER") && !u.getEmailVerified()));
    }

    @Test
    void googleLogin_Fallback_Success_WithInitialName_ShouldNotUpdateNameFromGoogle() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setName("Initial Name");
        request.setAccessToken("token");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) -> {
            Map<String, Object> body = new HashMap<>();
            body.put("email", "test@example.com");
            body.put("name", "Google Name"); // Should be ignored because initial name exists
            ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);
            when(mock.getForEntity(anyString(), eq(Map.class))).thenReturn(response);
        })) {
            UserEntity user = new UserEntity("Initial Name", "test@example.com", "pass", "CUSTOMER");
            user.setId(UUID.randomUUID());
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(tokenProvider.generateToken(any())).thenReturn("jwt-token");

            LoginResponse response = authService.googleLogin(request);

            assertEquals("Initial Name", user.getName());
            assertEquals("jwt-token", response.getAccessToken());
        }
    }

    private void mockAdminAuthentication() {
        Authentication auth = mock(Authentication.class);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))).when(auth).getAuthorities();
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    private void mockCustomerAuthentication() {
        Authentication auth = mock(Authentication.class);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).when(auth).getAuthorities();
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }
}
