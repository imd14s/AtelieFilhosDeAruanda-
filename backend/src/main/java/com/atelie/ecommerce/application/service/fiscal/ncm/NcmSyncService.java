package com.atelie.ecommerce.application.service.fiscal.ncm;

import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmRepository;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmSyncGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NcmSyncService {

    private final NcmSyncGateway syncGateway;
    private final NcmRepository ncmRepository;

    @Transactional
    public void synchronizeNcms() {
        List<Ncm> ncms = syncGateway.fetchOfficialNcms();
        if (ncms != null && !ncms.isEmpty()) {
            ncmRepository.saveAll(ncms);
        }
    }
}
