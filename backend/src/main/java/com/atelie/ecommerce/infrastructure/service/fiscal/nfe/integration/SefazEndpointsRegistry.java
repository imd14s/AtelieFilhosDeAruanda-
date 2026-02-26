package com.atelie.ecommerce.infrastructure.service.fiscal.nfe.integration;

import org.springframework.stereotype.Component;

@Component
public class SefazEndpointsRegistry {

    // Simples Registry de URLs Autorizadoras
    // Mapeamento mínimo SP/Sefaz Virtual Rio Grande do Sul

    public String getNfeAutorizacaoUrl(String uf, boolean isProduction) {
        if (isProduction) {
            if ("SP".equalsIgnoreCase(uf))
                return "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx";
            return "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx"; // Fallback SVRS
        } else {
            if ("SP".equalsIgnoreCase(uf))
                return "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx";
            return "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx";
        }
    }

    public String getNfeStatusUrl(String uf, boolean isProduction) {
        if (isProduction) {
            if ("SP".equalsIgnoreCase(uf))
                return "https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx";
            return "https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx";
        } else {
            if ("SP".equalsIgnoreCase(uf))
                return "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx";
            return "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx";
        }
    }
}
