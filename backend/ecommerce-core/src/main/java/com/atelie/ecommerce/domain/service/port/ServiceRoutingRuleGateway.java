package com.atelie.ecommerce.domain.service.port;

import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;

import java.util.List;

public interface ServiceRoutingRuleGateway {
    List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type);
}
