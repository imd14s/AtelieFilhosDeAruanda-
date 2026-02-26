package com.atelie.ecommerce.domain.fiscal.nfe;

import com.atelie.ecommerce.domain.order.model.OrderModel;

public interface NfeDataMapperPort {
    String generateNfeXml(OrderModel order);
}
