package com.atelie.ecommerce.application.service.catalog.product;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class GtinGeneratorService {

    private final Random random = new Random();

    /**
     * Gera um EAN-13 válido iniciado com '2' (Uso interno/Restrito).
     * Formato: 2 + 11 dígitos aleatórios + Dígito Verificador.
     */
    public String generateInternalEan13() {
        StringBuilder sb = new StringBuilder("2"); // Prefixo interno comum
        for (int i = 0; i < 11; i++) {
            sb.append(random.nextInt(10));
        }
        String codeWithoutDigit = sb.toString();
        int checkDigit = calculateCheckDigit(codeWithoutDigit);
        return codeWithoutDigit + checkDigit;
    }

    private int calculateCheckDigit(String code) {
        int sum = 0;
        for (int i = 0; i < code.length(); i++) {
            int digit = Character.getNumericValue(code.charAt(i));
            if (i % 2 == 0) { // Par (0-index, na spec é ímpar) -> x1
                sum += digit;
            } else { // Ímpar (0-index, na spec é par) -> x3
                sum += digit * 3;
            }
        }
        int remainder = sum % 10;
        return (remainder == 0) ? 0 : 10 - remainder;
    }
}
