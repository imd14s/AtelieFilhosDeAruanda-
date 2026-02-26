package com.atelie.ecommerce.application.dto.fiscal.ncm;

import com.atelie.ecommerce.domain.common.pagination.PageResult;

import java.util.List;
import java.util.function.Function;

public record PageResponseDTO<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int currentPage,
        int pageSize) {
    public static <T, U> PageResponseDTO<U> from(PageResult<T> pageResult, Function<T, U> mapper) {
        List<U> mappedContent = pageResult.content().stream()
                .map(mapper)
                .toList();
        return new PageResponseDTO<>(
                mappedContent,
                pageResult.totalElements(),
                pageResult.totalPages(),
                pageResult.currentPage(),
                pageResult.pageSize());
    }
}
