package com.atelie.ecommerce.application.service.ai;

import org.springframework.stereotype.Service;

@Service
public class AiContentService {

    /**
     * Gera uma descrição determinística (sem dependências externas).
     * Em produção, você pode trocar por integração real via ENV/Config Table.
     */
    public String generateDescription(String productName, String context) {
        String name = (productName == null || productName.isBlank()) ? "Produto" : productName.trim();
        String ctx = (context == null) ? "" : context.trim();

        if (ctx.isBlank()) {
            return name + " — descrição gerada automaticamente para catálogo. " +
                   "Produto selecionado com cuidado, com foco em qualidade e boa experiência.";
        }

        return name + " — " + ctx + " " +
               "Descrição gerada automaticamente para catálogo, com foco em clareza e conversão.";
    }

    /**
     * Sem credenciais/IA: retorna a mesma referência de imagem.
     * Quando você habilitar IA, aqui vira chamada real.
     */
    public String removeImageBackground(String imageUrlOrPath) {
        if (imageUrlOrPath == null || imageUrlOrPath.isBlank()) {
            throw new IllegalArgumentException("imageUrlOrPath is required");
        }
        return imageUrlOrPath.trim();
    }
}
