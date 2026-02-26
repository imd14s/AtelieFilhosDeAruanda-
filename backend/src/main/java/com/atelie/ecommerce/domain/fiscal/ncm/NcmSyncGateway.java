package com.atelie.ecommerce.domain.fiscal.ncm;

import java.util.List;

public interface NcmSyncGateway {

    /**
     * Fetches all official NCMs from an external authoritative source.
     * 
     * @return List of NCM domain entities
     */
    List<Ncm> fetchOfficialNcms();
}
