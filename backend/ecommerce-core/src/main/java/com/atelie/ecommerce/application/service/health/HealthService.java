package com.atelie.ecommerce.application.service.health;

/**
 * HealthService.
 *
 * Objetivo:
 * - Fornecer o status da aplicação para o Controller e monitoramento.
 */
public class HealthService {

    /**
     * Retorna o status atual do serviço.
     *
     * @return "OK"
     */
    public String getStatus() {
        return "OK";
    }
}
