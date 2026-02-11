package com.atelie.ecommerce.api.common.exception;

import com.atelie.ecommerce.api.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler global de exceções para a API.
 * 
 * Captura todas as exceções e retorna respostas padronizadas seguindo RFC 7807.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

        /**
         * Trata erros de validação (@Valid em DTOs).
         * Retorna 400 Bad Request com detalhes dos campos inválidos.
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationErrors(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getAllErrors().forEach(error -> {
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        errors.put(fieldName, errorMessage);
                });

                ErrorResponse response = ErrorResponse.builder()
                                .type("about:blank")
                                .title("Validação Falhou")
                                .status(HttpStatus.BAD_REQUEST.value())
                                .detail("Um ou mais campos possuem valores inválidos")
                                .instance(request.getRequestURI())
                                .errors(errors)
                                .build();

                return ResponseEntity.badRequest().body(response);
        }

        /**
         * Trata recursos não encontrados.
         * Retorna 404 Not Found.
         */
        @ExceptionHandler(NotFoundException.class)
        public ResponseEntity<ErrorResponse> handleNotFound(
                        NotFoundException ex,
                        HttpServletRequest request) {

                ErrorResponse response = ErrorResponse.builder()
                                .type("about:blank")
                                .title("Recurso Não Encontrado")
                                .status(HttpStatus.NOT_FOUND.value())
                                .detail(ex.getMessage())
                                .instance(request.getRequestURI())
                                .build();

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        /**
         * Trata recursos duplicados.
         * Retorna 409 Conflict.
         */
        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ErrorResponse> handleDuplicateResource(
                        DuplicateResourceException ex,
                        HttpServletRequest request) {

                ErrorResponse response = ErrorResponse.builder()
                                .type("about:blank")
                                .title("Recurso Duplicado")
                                .status(HttpStatus.CONFLICT.value())
                                .detail(ex.getMessage())
                                .instance(request.getRequestURI())
                                .build();

                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        /**
         * Trata conflitos genéricos.
         * Retorna 409 Conflict.
         */
        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<ErrorResponse> handleConflict(
                        ConflictException ex,
                        HttpServletRequest request) {

                ErrorResponse response = ErrorResponse.builder()
                                .type("about:blank")
                                .title("Conflito")
                                .status(HttpStatus.CONFLICT.value())
                                .detail(ex.getMessage())
                                .instance(request.getRequestURI())
                                .build();

                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        /**
         * Trata não autorizado.
         * Retorna 401 Unauthorized.
         */
        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponse> handleUnauthorized(
                        UnauthorizedException ex,
                        HttpServletRequest request) {

                ErrorResponse response = ErrorResponse.builder()
                                .type("about:blank")
                                .title("Não Autorizado")
                                .status(HttpStatus.UNAUTHORIZED.value())
                                .detail(ex.getMessage())
                                .instance(request.getRequestURI())
                                .build();

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        /**
         * Trata erros de regra de negócio.
         * Retorna 422 Unprocessable Entity.
         */
        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ErrorResponse> handleBusinessException(
                        BusinessException ex,
                        HttpServletRequest request) {

                ErrorResponse response = ErrorResponse.builder()
                                .type("about:blank")
                                .title("Regra de Negócio")
                                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                                .detail(ex.getMessage())
                                .instance(request.getRequestURI())
                                .build();

                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
        }

        /**
         * Trata exceções genéricas não capturadas.
         * Retorna 500 Internal Server Error.
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {

                ErrorResponse response = ErrorResponse.builder()
                                .type("about:blank")
                                .title("Erro Interno do Servidor")
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .detail("Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.")
                                .instance(request.getRequestURI())
                                .build();

                // Log do erro para debug (em produção, usar logger apropriado)
                ex.printStackTrace();

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
}
