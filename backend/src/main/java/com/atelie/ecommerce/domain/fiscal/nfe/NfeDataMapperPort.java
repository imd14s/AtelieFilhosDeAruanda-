package com.atelie.ecommerce.domain.fiscal.nfe;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;

public interface NfeDataMapperPort {
    String generateNfeXml(OrderEntity order);
}
