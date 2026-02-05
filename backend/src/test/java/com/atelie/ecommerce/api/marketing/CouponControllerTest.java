package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.Coupon;
import com.atelie.ecommerce.infrastructure.persistence.marketing.CouponRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CouponControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CouponRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void create_ShouldCreateCoupon() throws Exception {
        Coupon coupon = new Coupon();
        coupon.setCode("TEST10");
        coupon.setType(Coupon.CouponType.PERCENTAGE);
        coupon.setValue(BigDecimal.TEN);
        coupon.setUsageLimit(100);

        mockMvc.perform(post("/api/marketing/coupons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(coupon)))
                .andExpect(status().isCreated()) // Or ok depending on impl
                .andExpect(jsonPath("$.code", is("TEST10")));
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void getAll_ShouldReturnCoupons() throws Exception {
        mockMvc.perform(get("/api/marketing/coupons"))
                .andExpect(status().isOk());
    }
}
