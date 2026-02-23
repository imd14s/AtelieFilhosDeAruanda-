package com.atelie.ecommerce.api.serviceengine;

import java.util.Map;

public record ServiceResult(
                boolean success,
                String providerCode,
                Map<String, Object> payload,
                String error) {
}
