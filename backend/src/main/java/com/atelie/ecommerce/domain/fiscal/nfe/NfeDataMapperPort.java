package com.atelie.ecommerce.domain.fiscal.nfe;

import com.atelie.ecommerce.domain.order.model.OrderModel;
import java.util.Map;

public interface NfeDataMapperPort {
    String generateNfeXml(OrderModel order, Map<String, String> configs);
}
