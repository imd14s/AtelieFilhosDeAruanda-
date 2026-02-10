package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.api.admin.dto.CreateUserDTO;
import com.atelie.ecommerce.application.service.auth.AuthService;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AdminUserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createEmployee(@Valid @RequestBody CreateUserDTO request) {
        authService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserEntity>> listEmployees() {
        // Simple listing for now. Ideally should filter by ROLE_EMPLOYEE or similar.
        // Returning all users is fine for MVP admin, or filter in service.
        // Let's return all for now to let admin see customers too.
        return ResponseEntity.ok(userRepository.findAll());
    }
}
