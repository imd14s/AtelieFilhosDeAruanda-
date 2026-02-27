package com.atelie.ecommerce.infrastructure.config.web;

import com.atelie.ecommerce.application.service.catalog.dto.SeoMetadataDTO;
import com.atelie.ecommerce.application.service.catalog.SeoMetadataService;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeoInjectionFilter extends OncePerRequestFilter {

    private final SeoMetadataService seoMetadataService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    private static final Pattern PRODUCT_PATH_PATTERN = Pattern.compile("^/produto/([^/]+)/?$");
    private static final Pattern CATEGORY_PATH_PATTERN = Pattern.compile("^/categoria/([^/]+)/?$");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String userAgent = request.getHeader("User-Agent");

        // Se for um Crawler ou se for uma rota de página (e não API), injetamos
        // metadados
        if (isSeoTarget(path, userAgent)) {
            injectMetadata(request, response, path);
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private boolean isSeoTarget(String path, String userAgent) {
        // Ignora chamadas de API, estáticos e etc
        if (path.startsWith("/api/") || path.contains(".")) {
            return false;
        }

        // Verifica se é um bot conhecido
        if (userAgent != null) {
            String ua = userAgent.toLowerCase();
            return ua.contains("googlebot") || ua.contains("whatsapp") || ua.contains("facebookexternalhit")
                    || ua.contains("twitterbot") || ua.contains("bingbot") || ua.contains("linkedinbot");
        }

        return false;
    }

    private void injectMetadata(HttpServletRequest request, HttpServletResponse response, String path)
            throws IOException {
        SeoMetadataDTO metadata = resolveMetadata(path);

        // Tenta ler o index.html da pasta static (onde o frontend buildado deve estar)
        ClassPathResource resource = new ClassPathResource("static/index.html");
        if (!resource.exists()) {
            log.warn("index.html not found in static folder. Skipping SEO injection.");
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        String html = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        String injectedHtml = performInjection(html, metadata);

        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write(injectedHtml);
    }

    private SeoMetadataDTO resolveMetadata(String path) {
        Matcher productMatcher = PRODUCT_PATH_PATTERN.matcher(path);
        if (productMatcher.matches()) {
            String idOrSlug = productMatcher.group(1);
            Optional<ProductEntity> product = productRepository.findBySlug(idOrSlug);
            if (product.isEmpty()) {
                try {
                    product = productRepository.findById(UUID.fromString(idOrSlug));
                } catch (Exception ignored) {
                }
            }
            if (product.isPresent()) {
                return seoMetadataService.generateForProduct(product.get());
            }
        }

        Matcher categoryMatcher = CATEGORY_PATH_PATTERN.matcher(path);
        if (categoryMatcher.matches()) {
            try {
                UUID id = UUID.fromString(categoryMatcher.group(1));
                Optional<CategoryEntity> category = categoryRepository.findById(id);
                if (category.isPresent()) {
                    return seoMetadataService.generateForCategory(category.get());
                }
            } catch (Exception ignored) {
            }
        }

        return seoMetadataService.generateDefault();
    }

    private String performInjection(String html, SeoMetadataDTO meta) {
        StringBuilder metaTags = new StringBuilder();

        // Injeta no <head>
        metaTags.append(String.format(
                "\n  <title>%s</title>\n" +
                        "  <meta name=\"description\" content=\"%s\" />\n" +
                        "  <link rel=\"canonical\" href=\"%s\" />\n" +
                        "  <meta property=\"og:title\" content=\"%s\" />\n" +
                        "  <meta property=\"og:description\" content=\"%s\" />\n" +
                        "  <meta property=\"og:image\" content=\"%s\" />\n" +
                        "  <meta property=\"og:type\" content=\"%s\" />\n" +
                        "  <meta name=\"twitter:card\" content=\"%s\" />\n",
                meta.getTitle(), meta.getDescription(), meta.getCanonicalUrl(),
                meta.getOgTitle(), meta.getOgDescription(), meta.getOgImage(),
                meta.getOgType(), meta.getTwitterCard()));

        if (meta.getJsonLd() != null && !meta.getJsonLd().isEmpty()) {
            metaTags.append(String.format("  <script type=\"application/ld+json\">%s</script>\n", meta.getJsonLd()));
        }

        // Remove tags existentes para evitar duplicidade se o build já tiver algo
        // estático
        String cleanHtml = html.replaceAll("<title>.*</title>", "")
                .replaceAll("<meta name=\"description\" content=\".*\" />", "")
                .replaceAll("<meta property=\"og:.*\" content=\".*\" />", "");

        return cleanHtml.replace("<head>", "<head>" + metaTags.toString());
    }
}
