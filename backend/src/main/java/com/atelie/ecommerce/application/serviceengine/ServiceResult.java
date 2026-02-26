package com.atelie.ecommerce.application.serviceengine;

import java.util.Map;

public record ServiceResult(
                boolean success,
                String providerCode,
                Map<String, Object> payload,
                String error) {
}
