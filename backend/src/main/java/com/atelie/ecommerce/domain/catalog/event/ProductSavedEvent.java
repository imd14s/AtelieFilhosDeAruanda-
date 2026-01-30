package com.atelie.ecommerce.domain.catalog.event;

import java.util.UUID;

/**
 * Evento de domínio emitido quando um produto é salvo/criado.
 *
 * Esse evento é usado para disparar integrações assíncronas (ex.: sync multicanal),
 * sem acoplar o core a um provider específico.
 */
public record ProductSavedEvent(
        UUID productId,
        boolean isNew
) {}
