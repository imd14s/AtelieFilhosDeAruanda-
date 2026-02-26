package com.atelie.ecommerce.domain.common.pagination;

import java.util.List;

public record PageResult<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int currentPage,
        int pageSize) {
}
