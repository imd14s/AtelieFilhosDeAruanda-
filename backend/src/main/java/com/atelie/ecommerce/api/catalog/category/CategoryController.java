package com.atelie.ecommerce.api.catalog.category;

import com.atelie.ecommerce.api.catalog.category.dto.CreateCategoryRequest;
import com.atelie.ecommerce.api.catalog.category.dto.CategoryResponse;
import com.atelie.ecommerce.api.common.dto.ErrorResponse;
import com.atelie.ecommerce.application.service.catalog.category.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categorias", description = "Gestão de categorias de produtos")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar categoria", description = "Cria uma nova categoria de produtos")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoria criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Categoria com este nome já existe", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public CategoryResponse create(@Valid @RequestBody CreateCategoryRequest request) {
        return service.create(request);
    }

    @GetMapping
    @Operation(summary = "Listar categorias", description = "Retorna todas as categorias cadastradas")
    @ApiResponse(responseCode = "200", description = "Lista de categorias retornada com sucesso")
    public List<CategoryResponse> list() {
        return service.list();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deletar categoria", description = "Remove uma categoria pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Categoria removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada")
    })
    public void delete(@PathVariable java.util.UUID id) {
        service.delete(id);
    }
}
