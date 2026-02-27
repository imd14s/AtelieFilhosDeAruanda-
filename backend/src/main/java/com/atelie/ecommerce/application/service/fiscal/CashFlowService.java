package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry;
import com.atelie.ecommerce.domain.fiscal.repository.CashFlowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CashFlowService {

    private final CashFlowRepository cashFlowRepository;

    public Map<String, BigDecimal> getBalanceSummary() {
        List<CashFlowEntry> entries = cashFlowRepository.findAllAvailable();
        BigDecimal availableBalance = entries.stream()
                .map(CashFlowEntry::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // O saldo pendente são as entradas PENDING
        // Como o repositório não tem findAllPending(), vamos usar
        // findAllPendingUntil(long distant future)
        // ou adicionar um método no repo. Vamos adicionar no repo depois.
        // Por enquanto, vamos buscar todos e filtrar (simplificado para MVP)

        List<CashFlowEntry> pendingEntries = cashFlowRepository
                .findAllPendingUntil(Instant.now().plus(365, ChronoUnit.DAYS));
        BigDecimal pendingBalance = pendingEntries.stream()
                .map(CashFlowEntry::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "availableBalance", availableBalance,
                "pendingBalance", pendingBalance,
                "totalBalance", availableBalance.add(pendingBalance));
    }

    public List<Map<String, Object>> getProjection(int days) {
        Instant limitDate = Instant.now().plus(days, ChronoUnit.DAYS);
        List<CashFlowEntry> pendingEntries = cashFlowRepository.findAllPendingUntil(limitDate);

        Map<Instant, BigDecimal> dailyProjection = new TreeMap<>();

        for (CashFlowEntry entry : pendingEntries) {
            Instant date = entry.getExpectedReleaseDate().truncatedTo(ChronoUnit.DAYS);
            dailyProjection.put(date, dailyProjection.getOrDefault(date, BigDecimal.ZERO).add(entry.getNetAmount()));
        }

        return dailyProjection.entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", e.getKey());
                    map.put("amount", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
