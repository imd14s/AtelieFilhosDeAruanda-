package com.atelie.ecommerce.api.fiscal.ncm;

import com.atelie.ecommerce.api.fiscal.ncm.dto.NcmResponse;
import com.atelie.ecommerce.application.service.fiscal.ncm.NcmService;
import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fiscal/ncm")
@RequiredArgsConstructor
@Tag(name = "Fiscal", description = "Endpoints para consultas fiscais (NCM, etc)")
public class NcmController {

    private final NcmService ncmService;

    @GetMapping
    @Operation(summary = "Pequisa no catálogo NCM por código ou descrição")
    public ResponseEntity<List<NcmResponse>> search(@RequestParam(value = "query", required = false) String query) {
        List<Ncm> results = ncmService.searchNcms(query);

        List<NcmResponse> response = results.stream()
                .map(ncm -> new NcmResponse(ncm.code(), ncm.description()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
