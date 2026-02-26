package com.atelie.ecommerce.domain.catalog.product;

import lombok.Getter;

@Getter
public enum ProductOrigin {
    NACIONAL(0, "Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8"),
    ESTRANGEIRA_IMPORTACAO_DIRETA(1, "Estrangeira - Importação direta, exceto a indicada no código 6"),
    ESTRANGEIRA_ADQUIRIDA_MERCADO_INTERNO(2,
            "Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7"),
    NACIONAL_CONTEUDO_IMPORTACAO_SUPERIOR_40(3,
            "Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%"),
    NACIONAL_PROCESSOS_PRODUTIVOS_BASICOS(4,
            "Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam as legislações citadas nos Ajustes"),
    NACIONAL_CONTEUDO_IMPORTACAO_INFERIOR_40(5,
            "Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%"),
    ESTRANGEIRA_IMPORTACAO_DIRETA_SEM_SIMILAR(6,
            "Estrangeira - Importação direta, sem similar nacional, constante em lista de Resolução do CAMEX e gás natural"),
    ESTRANGEIRA_ADQUIRIDA_MERCADO_INTERNO_SEM_SIMILAR(7,
            "Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução do CAMEX e gás natural"),
    NACIONAL_CONTEUDO_IMPORTACAO_SUPERIOR_70(8,
            "Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%");

    private final int code;
    private final String description;

    ProductOrigin(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public static ProductOrigin fromCode(int code) {
        for (ProductOrigin origin : values()) {
            if (origin.code == code) {
                return origin;
            }
        }
        return NACIONAL;
    }
}
