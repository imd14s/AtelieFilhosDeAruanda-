package com.atelie.ecommerce.infrastructure.service.fiscal.ncm;

import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmSyncGateway;
import com.atelie.ecommerce.infrastructure.service.fiscal.ncm.dto.BrasilApiNcmDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BrasilApiNcmGateway implements NcmSyncGateway {

    private static final Logger log = LoggerFactory.getLogger(BrasilApiNcmGateway.class);
    private static final String BRASIL_API_URL = "https://brasilapi.com.br/api/ncm/v1";

    private final RestTemplate restTemplate;

    public BrasilApiNcmGateway() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public List<Ncm> fetchOfficialNcms() {
        log.info("Fetching NCMs from BrasilAPI: {}", BRASIL_API_URL);
        try {
            ResponseEntity<List<BrasilApiNcmDto>> response = restTemplate.exchange(
                    BRASIL_API_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<BrasilApiNcmDto>>() {
                    });

            List<BrasilApiNcmDto> dtos = response.getBody();
            if (dtos == null) {
                return List.of();
            }

            return dtos.stream()
                    .map(dto -> new Ncm(dto.codigo(), dto.descricao()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch NCMs from external API", e);
            throw new RuntimeException("Integration error while fetching NCMs", e);
        }
    }
}
