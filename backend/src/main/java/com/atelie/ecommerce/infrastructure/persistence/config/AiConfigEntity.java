package com.atelie.ecommerce.infrastructure.persistence.config;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "configuracoes_ia")
public class AiConfigEntity {

    @Id
    private UUID id;

    @Column(name = "nome_ia", nullable = false)
    private String nomeIa;

    @Column(name = "api_key", nullable = false)
    private String apiKey;

    @Column(name = "pre_prompt", columnDefinition = "TEXT")
    private String prePrompt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AiConfigEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNomeIa() {
        return nomeIa;
    }

    public void setNomeIa(String nomeIa) {
        this.nomeIa = nomeIa;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getPrePrompt() {
        return prePrompt;
    }

    public void setPrePrompt(String prePrompt) {
        this.prePrompt = prePrompt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
