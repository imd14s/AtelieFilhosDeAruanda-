package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;

public record ResolvedProvider(
        ServiceProvider provider,
        String reason
) {}
