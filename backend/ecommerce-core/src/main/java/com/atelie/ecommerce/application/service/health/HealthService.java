package com.atelie.ecommerce.application.service.health;

import org.springframework.stereotype.Service;

/**
 * HealthService.
 *
 * Responsável por fornecer o status de saúde do sistema.
 */
@Service
public class HealthService {

    /**
     * Retorna o status textual do sistema.
     *
     * @return String com status (ex: "OK").
     */
    public String status() {
        return "OK";
    }
}
