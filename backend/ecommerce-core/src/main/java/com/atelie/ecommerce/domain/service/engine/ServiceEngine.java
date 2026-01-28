package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.service.model.ServiceType;

public interface ServiceEngine {
    ResolvedProvider resolve(ServiceType type, ServiceContext ctx);
}
