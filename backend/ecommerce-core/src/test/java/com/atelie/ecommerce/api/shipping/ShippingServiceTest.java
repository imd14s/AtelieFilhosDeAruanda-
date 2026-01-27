package com.atelie.ecommerce.api.shipping;

import com.atelie.ecommerce.TestProfileConfig;
import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.shipping.dto.ShippingQuoteResponse;
import com.atelie.ecommerce.api.shipping.service.ShippingService;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import com.atelie.ecommerce.testsupport.SystemConfigTestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ShippingServiceTest extends TestProfileConfig {

    @Autowired
    ShippingService shippingService;

    @Autowired
    DynamicConfigService configService;

    @Autowired
    SystemConfigRepository repo;

    @BeforeEach
    void setup() {
        SystemConfigTestHelper.upsert(repo, "SHIPPING_PROVIDER_MODE", "J3");
        SystemConfigTestHelper.upsert(repo, "J3_RATE", "13.00");
        SystemConfigTestHelper.upsert(repo, "J3_FREE_SHIPPING_THRESHOLD", "299.00");
        SystemConfigTestHelper.upsert(repo, "J3_CEP_PREFIXES", "010,20040");
        SystemConfigTestHelper.upsert(repo, "FLAT_RATE", "13.00");
        SystemConfigTestHelper.upsert(repo, "FLAT_FREE_SHIPPING_THRESHOLD", "299.00");

        configService.refresh();
    }

    @Test
    void j3AppliesFreeShippingAtThreshold() {
        ShippingQuoteResponse r = shippingService.quote("01001-000", new BigDecimal("299.00"), null);
        assertEquals("J3", r.getProvider());
        assertTrue(r.isEligible());
        assertTrue(r.isFreeShippingApplied());
        assertEquals(new BigDecimal("0"), r.getShippingCost().stripTrailingZeros());
    }

    @Test
    void j3ChargesRateBelowThreshold() {
        ShippingQuoteResponse r = shippingService.quote("01001-000", new BigDecimal("100.00"), null);
        assertEquals("J3", r.getProvider());
        assertTrue(r.isEligible());
        assertFalse(r.isFreeShippingApplied());
        assertEquals(new BigDecimal("13.00"), r.getShippingCost());
    }

    @Test
    void j3NotEligibleWhenPrefixNotMatched() {
        ShippingQuoteResponse r = shippingService.quote("99999-000", new BigDecimal("100.00"), null);
        assertEquals("J3", r.getProvider());
        assertFalse(r.isEligible());
        assertEquals(new BigDecimal("13.00"), r.getShippingCost());
    }
}
