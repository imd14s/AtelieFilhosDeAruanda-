package com.atelie.ecommerce.application.service.fiscal;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Service
public class FiscalExtractorService {

    public TaxBreakdown extractTaxes(String xml) {
        if (xml == null || xml.isEmpty()) {
            return new TaxBreakdown(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO);
        }

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            XPath xPath = XPathFactory.newInstance().newXPath();

            // Totalizadores da NF-e (vICMS, vPIS, vCOFINS, vISS)
            BigDecimal icms = parseValue(xPath.compile("//vICMS").evaluate(doc, XPathConstants.STRING));
            BigDecimal pis = parseValue(xPath.compile("//vPIS").evaluate(doc, XPathConstants.STRING));
            BigDecimal cofins = parseValue(xPath.compile("//vCOFINS").evaluate(doc, XPathConstants.STRING));
            BigDecimal iss = parseValue(xPath.compile("//vISS").evaluate(doc, XPathConstants.STRING));
            BigDecimal total = parseValue(xPath.compile("//vNF").evaluate(doc, XPathConstants.STRING)); // Valor da Nota
                                                                                                        // (Bruto)

            // Nota: vNF não é o imposto, vTotTrib ou a soma de ICMS+PIS+COFINS é o imposto.
            // Para Simples Nacional, às vezes os impostos não vêm destacados da mesma
            // forma.
            BigDecimal calculatedTaxes = icms.add(pis).add(cofins).add(iss);

            return new TaxBreakdown(calculatedTaxes, icms, pis, cofins, iss);

        } catch (Exception e) {
            // Se falhar o XML, retorna zero (fallback para cálculo simulado pode ser feito
            // no Aggregator)
            return new TaxBreakdown(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO);
        }
    }

    private BigDecimal parseValue(Object val) {
        if (val == null || val.toString().isEmpty())
            return BigDecimal.ZERO;
        try {
            return new BigDecimal(val.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    public record TaxBreakdown(
            BigDecimal totalTaxes,
            BigDecimal icms,
            BigDecimal pis,
            BigDecimal cofins,
            BigDecimal iss) {
    }
}
