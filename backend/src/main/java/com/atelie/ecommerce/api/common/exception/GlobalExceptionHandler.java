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

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Validação Falhou",
                                HttpStatus.BAD_REQUEST.value(),
                                "Um ou mais campos possuem valores inválidos",
                                request.getRequestURI(),
                                errors);

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

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Recurso Não Encontrado",
                                HttpStatus.NOT_FOUND.value(),
                                ex.getMessage(),
                                request.getRequestURI());

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

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Recurso Duplicado",
                                HttpStatus.CONFLICT.value(),
                                ex.getMessage(),
                                request.getRequestURI());

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

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Conflito",
                                HttpStatus.CONFLICT.value(),
                                ex.getMessage(),
                                request.getRequestURI());

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

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Não Autorizado",
                                HttpStatus.UNAUTHORIZED.value(),
                                ex.getMessage(),
                                request.getRequestURI());

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        /**
         * Trata credenciais inválidas.
         * Retorna 401 Unauthorized.
         */
        @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
        public ResponseEntity<ErrorResponse> handleBadCredentials(
                        org.springframework.security.authentication.BadCredentialsException ex,
                        HttpServletRequest request) {

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Credenciais Inválidas",
                                HttpStatus.UNAUTHORIZED.value(),
                                "Usuário ou senha incorretos",
                                request.getRequestURI());

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        /**
         * Trata argumentos inválidos (IllegalArgumentException).
         * Retorna 400 Bad Request.
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgument(
                        IllegalArgumentException ex,
                        HttpServletRequest request) {

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Requisição Inválida",
                                HttpStatus.BAD_REQUEST.value(),
                                ex.getMessage(),
                                request.getRequestURI());

                return ResponseEntity.badRequest().body(response);
        }

        /**
         * Trata erros de regra de negócio.
         * Retorna 422 Unprocessable Entity.
         */
        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ErrorResponse> handleBusinessException(
                        BusinessException ex,
                        HttpServletRequest request) {

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Regra de Negócio",
                                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                                ex.getMessage(),
                                request.getRequestURI());

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

                ErrorResponse response = new ErrorResponse(
                                "about:blank",
                                "Erro Interno do Servidor",
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
                                request.getRequestURI());

                // Log do erro para debug (em produção, usar logger apropriado)
                ex.printStackTrace();

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
}
