package com.atelie.ecommerce.application.service.fiscal.ncm;

import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NcmService {

    private final NcmRepository ncmRepository;

    public List<Ncm> searchNcms(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        // Limite fixado em 20 para performance
        return ncmRepository.findAllByQuery(query, 20);
    }
}
