package com.atelie.ecommerce.application.service.shipping;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.HashSet;
import java.util.Set;

@Service
public class J3FlexCepService {

    private static final Logger logger = LoggerFactory.getLogger(J3FlexCepService.class);
    private final Set<String> validCeps = new HashSet<>();
    private static final String CSV_PATH = "../J3Flex.csv"; // Caminho relativo à raiz do projeto quando rodando do
                                                            // diretório backend

    @PostConstruct
    public void init() {
        loadCeps();
    }

    private void loadCeps() {
        File file = new File(CSV_PATH);
        if (!file.exists()) {
            // Tenta caminho direto se o relativo falhar (útil para diferentes ambientes de
            // execução)
            file = new File("J3Flex.csv");
        }

        if (!file.exists()) {
            logger.error("Arquivo J3Flex.csv não encontrado no caminho: {} ou na raiz.", CSV_PATH);
            return;
        }

        logger.info("Carregando CEPs do J3 Flex a partir de: {}", file.getAbsolutePath());
        int count = 0;
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Pular cabeçalho
                }
                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    String cep = normalizeCep(parts[1]);
                    if (!cep.isEmpty()) {
                        validCeps.add(cep);
                        count++;
                    }
                }
            }
            logger.info("J3 Flex: {} CEPs carregados com sucesso.", count);
        } catch (Exception e) {
            logger.error("Erro ao ler o arquivo J3Flex.csv", e);
        }
    }

    public boolean isEligible(String cep) {
        if (cep == null)
            return false;
        return validCeps.contains(normalizeCep(cep));
    }

    private String normalizeCep(String cep) {
        if (cep == null)
            return "";
        return cep.replaceAll("\\D+", "");
    }
}
