# Arquitetura do Projeto

## Objetivo
Descreva aqui o propósito do sistema e os limites.

## Camadas (exemplo)
- api/ (controllers, DTOs, validação HTTP)
- application/ (services, use cases)
- domain/ (entidades, regras de negócio, interfaces do domínio)
- infrastructure/ (persistência, integrações externas, configs)

## Invariantes (NÃO QUEBRAR)
1) Controller NÃO chama repository diretamente.
2) Domain NÃO depende de framework (Spring, JPA, etc.).
3) Infrastructure pode depender de qualquer camada, mas ninguém depende de infrastructure via import direto (somente via interfaces/ports).
4) Toda regra de negócio relevante deve ter teste.
