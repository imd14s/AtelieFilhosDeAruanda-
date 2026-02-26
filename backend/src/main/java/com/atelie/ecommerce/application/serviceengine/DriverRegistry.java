package com.atelie.ecommerce.application.serviceengine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Registry de drivers disponíveis no código.
 * Dashboard escolhe qual driverKey usar via DB.
 */
public class DriverRegistry {

    private final Map<String, ServiceDriver> driversByKey = new HashMap<>();

    public DriverRegistry(List<ServiceDriver> drivers) {
        for (ServiceDriver d : drivers) {
            driversByKey.put(d.driverKey(), d);
        }
    }

    public Optional<ServiceDriver> findByDriverKey(String driverKey) {
        return Optional.ofNullable(driversByKey.get(driverKey));
    }
}
