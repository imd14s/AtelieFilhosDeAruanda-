package com.atelie.ecommerce.api.customer;

import com.atelie.ecommerce.application.service.customer.UserAddressService;
import com.atelie.ecommerce.infrastructure.persistence.customer.entity.UserAddressEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
public class UserAddressController {

    private final UserAddressService addressService;

    public UserAddressController(UserAddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAddressEntity>> getAddresses(@PathVariable UUID userId) {
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<UserAddressEntity> createAddress(@PathVariable UUID userId,
            @RequestBody UserAddressEntity address) {
        return ResponseEntity.ok(addressService.createAddress(userId, address));
    }

    @PutMapping("/{addressId}/user/{userId}")
    public ResponseEntity<UserAddressEntity> updateAddress(@PathVariable UUID userId, @PathVariable UUID addressId,
            @RequestBody UserAddressEntity address) {
        return ResponseEntity.ok(addressService.updateAddress(userId, addressId, address));
    }

    @DeleteMapping("/{addressId}/user/{userId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID userId, @PathVariable UUID addressId) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}
