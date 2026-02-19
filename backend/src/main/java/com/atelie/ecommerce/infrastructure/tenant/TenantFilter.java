package com.atelie.ecommerce.infrastructure.tenant;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class TenantFilter implements Filter {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String tenantId = req.getHeader(TENANT_HEADER);

        // For now, we just log/capture it. In strict mode, we could reject.
        // Given the current transition phase, we allow requests without it but log
        // warning
        // or treat as "default" tenant if needed.

        if (tenantId != null && !tenantId.isBlank()) {
            TenantContext.setTenant(tenantId);
        } else {
            // Optional: enforce validation for specific paths if requirements generally
            // demand it
            // For now, purely capturing context.
        }

        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
