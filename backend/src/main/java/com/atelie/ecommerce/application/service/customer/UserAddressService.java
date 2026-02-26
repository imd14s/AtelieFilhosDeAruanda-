package com.atelie.ecommerce.application.service.customer;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.customer.entity.UserAddressEntity;
import com.atelie.ecommerce.infrastructure.persistence.customer.repository.UserAddressRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserAddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    public UserAddressService(UserAddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<UserAddressEntity> getUserAddresses(UUID userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public UserAddressEntity createAddress(UUID userId, UserAddressEntity address) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        address.setUser(user);

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefaults(userId);
        } else if (addressRepository.findByUserId(userId).isEmpty()) {
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    @Transactional
    public UserAddressEntity updateAddress(UUID userId, UUID addressId, UserAddressEntity update) {
        UserAddressEntity existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Endereço não pertence a este usuário");
        }

        existing.setLabel(update.getLabel());
        existing.setStreet(update.getStreet());
        existing.setNumber(update.getNumber());
        existing.setComplement(update.getComplement());
        existing.setNeighborhood(update.getNeighborhood());
        existing.setCity(update.getCity());
        existing.setState(update.getState());
        existing.setZipCode(update.getZipCode());
        existing.setDocument(update.getDocument());

        if (Boolean.TRUE.equals(update.getIsDefault()) && !Boolean.TRUE.equals(existing.getIsDefault())) {
            clearDefaults(userId);
            existing.setIsDefault(true);
        }

        return addressRepository.save(existing);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        UserAddressEntity existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Endereço não pertence a este usuário");
        }

        addressRepository.delete(existing);

        // Se deletou o padrão, torna o primeiro disponível como padrão
        if (Boolean.TRUE.equals(existing.getIsDefault())) {
            List<UserAddressEntity> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                addressRepository.save(remaining.get(0));
            }
        }
    }

    private void clearDefaults(UUID userId) {
        List<UserAddressEntity> defaults = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        for (UserAddressEntity addr : defaults) {
            addr.setIsDefault(false);
            addressRepository.save(addr);
        }
    }
}
