package com.atelie.ecommerce.application.integration;

import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.integration.repository.MarketplaceIntegrationRepository;
import com.atelie.ecommerce.infrastructure.security.EncryptionUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketplaceCoreServiceTest {

    @Mock
    private MarketplaceIntegrationFactory factory;

    @Mock
    private MarketplaceIntegrationRepository repository;

    @Mock
    private EncryptionUtility encryptionUtility;

    @Mock
    private IMarketplaceAdapter mockAdapter;

    @Mock
    private com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository productRepository;

    @Mock
    private com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository categoryRepository;

    @Mock
    private com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository providerRepository;

    private MarketplaceCoreService coreService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        coreService = new MarketplaceCoreService(factory, repository, encryptionUtility, objectMapper,
                productRepository, categoryRepository, providerRepository);
    }

    @Test
    void testCreateIntegration_NewIntegration_ShouldCreateIntegrationRecord() {
        // Arrange
        String provider = "mercadolivre";
        String accountName = "ML Principal";

        when(repository.save(any(MarketplaceIntegrationEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        MarketplaceIntegrationEntity result = coreService.createIntegration(provider, accountName);

        // Assert
        assertNotNull(result);
        assertEquals(provider, result.getProvider());
        assertEquals(accountName, result.getAccountName());
        assertFalse(result.isActive(), "New integration should not be active until OAuth is completed");

        verify(repository).save(any(MarketplaceIntegrationEntity.class));
    }

    @Test
    void testGetAuthorizationUrl_ValidIntegration_ShouldReturnUrl() throws Exception {
        // Arrange
        UUID integrationId = UUID.randomUUID();
        String provider = "tiktok";
        String redirectUri = "https://atelie.com/callback";
        String expectedUrl = "https://auth.tiktok-shop.com/authorize?app_key=TT123&state=" + integrationId.toString();

        MarketplaceIntegrationEntity integration = new MarketplaceIntegrationEntity(provider, false);
        integration.setEncryptedCredentials("encrypted_creds");

        Map<String, String> decryptedCreds = Map.of("appId", "TT123", "appSecret", "secret");
        String decryptedJson = objectMapper.writeValueAsString(decryptedCreds);

        when(repository.findById(integrationId)).thenReturn(Optional.of(integration));
        when(factory.getAdapter(provider)).thenReturn(Optional.of(mockAdapter));
        when(encryptionUtility.decrypt("encrypted_creds")).thenReturn(decryptedJson);
        when(mockAdapter.getAuthUrl(any(), eq(redirectUri), eq(integrationId.toString()))).thenReturn(expectedUrl);

        // Act
        String result = coreService.getAuthorizationUrl(integrationId, redirectUri);

        // Assert
        assertEquals(expectedUrl, result);
        verify(mockAdapter).getAuthUrl(any(), eq(redirectUri), eq(integrationId.toString()));
    }

    @Test
    void testHandleCallback_ValidCode_ShouldActivateIntegration() throws Exception {
        // Arrange
        String provider = "mercadolivre";
        String code = "auth_code_123";
        String redirectUri = "https://atelie.com/callback";
        UUID integrationId = UUID.randomUUID();
        String state = integrationId.toString();

        MarketplaceIntegrationEntity integration = new MarketplaceIntegrationEntity(provider, false);
        integration.setEncryptedCredentials("encrypted_creds");

        Map<String, String> decryptedCreds = Map.of("appId", "ML123", "clientSecret", "secret");
        String decryptedJson = objectMapper.writeValueAsString(decryptedCreds);

        Map<String, Object> authPayload = new HashMap<>();
        authPayload.put("accessToken", "token_abc");
        authPayload.put("refreshToken", "refresh_xyz");
        authPayload.put("expiresAt", System.currentTimeMillis() + 3600000);

        when(repository.findById(integrationId)).thenReturn(Optional.of(integration));
        when(factory.getAdapter(provider)).thenReturn(Optional.of(mockAdapter));
        when(encryptionUtility.decrypt("encrypted_creds")).thenReturn(decryptedJson);
        when(mockAdapter.handleAuthCallback(eq(code), any(), eq(redirectUri))).thenReturn(authPayload);
        when(repository.save(any(MarketplaceIntegrationEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        coreService.handleCallback(provider, code, redirectUri, state);

        // Assert
        ArgumentCaptor<MarketplaceIntegrationEntity> captor = ArgumentCaptor
                .forClass(MarketplaceIntegrationEntity.class);
        verify(repository).save(captor.capture());

        MarketplaceIntegrationEntity savedIntegration = captor.getValue();
        assertTrue(savedIntegration.isActive(), "Integration should be activated after successful OAuth");
        assertNotNull(savedIntegration.getAuthPayload(), "Auth payload should be saved");
    }

    @Test
    void testGetAuthorizationUrl_IntegrationNotFound_ShouldThrowException() {
        // Arrange
        UUID integrationId = UUID.randomUUID();
        String redirectUri = "https://atelie.com/callback";

        when(repository.findById(integrationId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            coreService.getAuthorizationUrl(integrationId, redirectUri);
        });

        assertTrue(exception.getMessage().contains("Integration not found for ID " + integrationId));
    }

    @Test
    void testEnsureValidToken_TokenExpiringSoon_ShouldRefresh() throws Exception {
        // Arrange
        UUID integrationId = UUID.randomUUID();
        String provider = "mercadolivre";
        long expiresAt = System.currentTimeMillis() + 300000; // 5 minutes from now (within 10min buffer)

        MarketplaceIntegrationEntity integration = new MarketplaceIntegrationEntity(provider, true);
        integration.setEncryptedCredentials("encrypted_creds");

        Map<String, Object> oldPayload = new HashMap<>();
        oldPayload.put("accessToken", "old_token");
        oldPayload.put("expiresAt", expiresAt);
        integration.setAuthPayload(objectMapper.writeValueAsString(oldPayload));

        Map<String, String> decryptedCreds = Map.of("appId", "ML123", "clientSecret", "secret");
        String decryptedJson = objectMapper.writeValueAsString(decryptedCreds);

        Map<String, Object> newPayload = new HashMap<>();
        newPayload.put("accessToken", "new_token");
        newPayload.put("expiresAt", System.currentTimeMillis() + 3600000);

        when(repository.findById(integrationId)).thenReturn(Optional.of(integration));
        when(factory.getAdapter(provider)).thenReturn(Optional.of(mockAdapter));
        when(encryptionUtility.decrypt("encrypted_creds")).thenReturn(decryptedJson);
        when(mockAdapter.refreshToken(eq(integration), any())).thenReturn(newPayload);
        when(repository.save(any(MarketplaceIntegrationEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        coreService.ensureValidToken(integrationId);

        // Assert
        verify(mockAdapter).refreshToken(eq(integration), any());
        verify(repository).save(any(MarketplaceIntegrationEntity.class));
    }
}
