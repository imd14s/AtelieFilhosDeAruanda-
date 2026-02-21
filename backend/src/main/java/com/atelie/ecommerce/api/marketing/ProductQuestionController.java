package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductQuestionRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductQuestionEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
public class ProductQuestionController {

    private final ProductQuestionRepository questionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductQuestionController(ProductQuestionRepository questionRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.questionRepository = questionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<ProductQuestionEntity> getMyQuestions(@RequestParam(required = false) UUID userId) {
        if (userId != null) {
            return questionRepository.findByUserId(userId);
        }
        return questionRepository.findAll();
    }

    @GetMapping("/product/{productId}")
    public List<ProductQuestionEntity> getProductQuestions(@PathVariable UUID productId) {
        return questionRepository.findByProductId(productId);
    }

    @PostMapping
    public ResponseEntity<?> askQuestion(@RequestBody QuestionRequest request) {
        var product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        var user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var question = ProductQuestionEntity.builder()
                .product(product)
                .user(user)
                .question(request.question())
                .status("PENDING")
                .build();

        return ResponseEntity.ok(questionRepository.save(question));
    }

    public record QuestionRequest(UUID productId, UUID userId, String question) {
    }
}
