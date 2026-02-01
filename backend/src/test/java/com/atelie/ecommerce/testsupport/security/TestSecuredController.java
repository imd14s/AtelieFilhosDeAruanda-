package com.atelie.ecommerce.testsupport.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TestSecuredController {

    @GetMapping("/test-secured")
    public ResponseEntity<String> secured() {
        return ResponseEntity.ok("ok");
    }

    @GetMapping("/admin/test-secured")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("admin-ok");
    }
}
