package com.atelie.ecommerce.application.service.health;

import org.springframework.stereotype.Service;

/**
 * HealthService.
 *
 * Serviço simples para healthcheck da aplicação.
 */
@Service
public class HealthService {

    /**
     * Retorna o status atual da aplicação.
     *
     * @return String com o status (ex: "OK")
     */
    public String getStatus() {
        return "OK";
    }
}
