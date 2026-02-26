package com.atelie.ecommerce.api.fiscal.ncm;

import com.atelie.ecommerce.application.dto.fiscal.ncm.NcmResponse;
import com.atelie.ecommerce.application.dto.fiscal.ncm.PageResponseDTO;
import com.atelie.ecommerce.application.service.fiscal.ncm.NcmService;
import com.atelie.ecommerce.application.service.fiscal.ncm.NcmSyncService;
import com.atelie.ecommerce.domain.common.pagination.PageResult;
import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fiscal/ncm")
@RequiredArgsConstructor
@Tag(name = "Fiscal", description = "Endpoints para consultas fiscais (NCM, etc)")
public class NcmController {

    private final NcmService ncmService;
    private final NcmSyncService ncmSyncService;

    @GetMapping
    @Operation(summary = "Pequisa no catálogo NCM por código ou descrição")
    public ResponseEntity<PageResponseDTO<NcmResponse>> search(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        PageResult<Ncm> results = ncmService.searchNcms(query, page, size);

        PageResponseDTO<NcmResponse> response = PageResponseDTO.from(
                results,
                ncm -> new NcmResponse(ncm.code(), ncm.description()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync")
    @Operation(summary = "Sincroniza a base local de NCMs com a BrasilAPI")
    public ResponseEntity<Void> syncNcms() {
        ncmSyncService.synchronizeNcms();
        return ResponseEntity.noContent().build();
    }
}
