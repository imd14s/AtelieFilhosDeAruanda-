package com.atelie.ecommerce.application.service.catalog;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SitemapService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Value("${app.frontend.url:https://ateliefilhosdearuanda.com.br}")
    private String baseUrl;

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    @Cacheable(value = "sitemap")
    public String generateSitemapXml() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // 1. Home Page
        addUrl(xml, baseUrl, "daily", "1.0");

        // 2. Static Pages
        addUrl(xml, baseUrl + "/store", "daily", "0.9");
        addUrl(xml, baseUrl + "/about", "monthly", "0.5");
        addUrl(xml, baseUrl + "/ethics", "monthly", "0.5");
        addUrl(xml, baseUrl + "/faq", "monthly", "0.5");
        addUrl(xml, baseUrl + "/contato", "monthly", "0.5");

        // 3. Categories
        categoryRepository.findAll().forEach(category -> {
            String url = baseUrl + "/categoria/" + category.getId();
            addUrl(xml, url, "weekly", "0.8");
        });

        // 4. Products
        productRepository.findAll().forEach(product -> {
            String slug = product.getSlug() != null ? product.getSlug() : product.getId().toString();
            String url = baseUrl + "/produto/" + slug;
            addUrl(xml, url, "daily", "0.7");
        });

        xml.append("</urlset>");
        return xml.toString();
    }

    private void addUrl(StringBuilder xml, String loc, String changefreq, String priority) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(loc).append("</loc>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    public String generateRobotsTxt() {
        StringBuilder sb = new StringBuilder();
        sb.append("User-agent: *\n");
        sb.append("Allow: /\n");
        sb.append("Disallow: /api/\n");
        sb.append("Disallow: /perfil/\n");
        sb.append("Disallow: /checkout/\n");
        sb.append("Disallow: /search/\n");
        sb.append("Disallow: /assinar/\n");
        sb.append("Disallow: /verify-newsletter\n");
        sb.append("Disallow: /unsubscribe\n");
        sb.append("\n");
        sb.append("Sitemap: ").append(baseUrl).append("/sitemap.xml\n");
        return sb.toString();
    }
}
