package com.atelie.ecommerce.application.service.fiscal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class SnapshotScheduler {

    private final SnapshotService snapshotService;

    /**
     * Roda no dia 1 de cada mês às 01:00 AM para gerar o snapshot do mês anterior.
     */
    @Scheduled(cron = "0 0 1 1 * ?")
    public void scheduleMonthlySnapshot() {
        LocalDate lastMonthDate = LocalDate.now().minusMonths(1);
        int month = lastMonthDate.getMonthValue();
        int year = lastMonthDate.getYear();

        log.info("Executando snapshot agendado para o período {}/{}", month, year);
        try {
            snapshotService.takeSnapshot(month, year);
            // Por padrão, não congelamos imediatamente para permitir ajustes de
            // reconciliação bancária
            // O congelamento pode ser feito manualmente ou após X dias.
        } catch (Exception e) {
            log.error("Falha no snapshot agendado: {}", e.getMessage());
        }
    }
}
