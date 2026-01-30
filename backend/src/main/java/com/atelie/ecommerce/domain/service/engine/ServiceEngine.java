package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.service.model.ServiceType;

/**
 * Interface Core para Motores de Serviço.
 * Define o contrato para resolução de provedores baseado em regras.
 */
public interface ServiceEngine {
    
    /**
     * Resolve qual provedor deve processar a requisição baseada no contexto.
     *
     * @param type Tipo do serviço (ex: PAYMENT, SHIPPING)
     * @param ctx Contexto da execução (dados variáveis)
     * @return O provedor resolvido e a estratégia utilizada
     */
    ResolvedProvider resolve(ServiceType type, ServiceContext ctx);
}
