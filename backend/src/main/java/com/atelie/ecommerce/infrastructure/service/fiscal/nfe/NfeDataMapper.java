package com.atelie.ecommerce.infrastructure.service.fiscal.nfe;

import com.atelie.ecommerce.domain.fiscal.nfe.NfeDataMapperPort;
import com.atelie.ecommerce.domain.order.model.OrderItemModel;
import com.atelie.ecommerce.domain.order.model.OrderModel;
import org.springframework.stereotype.Component;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import java.util.Map;

/**
 * Motor de mapeamento e serialização de dados de Negócio para o formato SEFAZ
 * NF-e 4.00.
 */
@Component
public class NfeDataMapper implements NfeDataMapperPort {

    private final NfeXmlValidator xmlValidator;

    public NfeDataMapper(NfeXmlValidator xmlValidator) {
        this.xmlValidator = xmlValidator;
    }

    @Override
    public String generateNfeXml(OrderModel order, Map<String, String> configs) {
        if (order == null) {
            throw new RuntimeException("Falha catastrófica ao mapear XML da NF-e para Pedido null");
        }
        try {
            DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
            Document doc = docBuilder.newDocument();

            // Tag Raiz <NFe>
            Element nfeElement = doc.createElement("NFe");
            nfeElement.setAttribute("xmlns", "http://www.portalfiscal.inf.br/nfe");
            doc.appendChild(nfeElement);

            // <infNFe>
            boolean isProd = "PRODUCAO".equalsIgnoreCase(configs.getOrDefault("FISCAL_ENVIRONMENT", "HOMOLOGACAO"));
            String serie = configs.getOrDefault("FISCAL_INVOICE_SERIES", "1");
            String nNF = String.valueOf(Integer.parseInt(configs.getOrDefault("FISCAL_INVOICE_NUMBER", "0")) + 1);

            Element infNFe = doc.createElement("infNFe");
            infNFe.setAttribute("Id", "NFe" + generateChaveAcesso(order, configs, isProd, serie, nNF));
            infNFe.setAttribute("versao", "4.00");
            nfeElement.appendChild(infNFe);

            // <ide>
            infNFe.appendChild(buildIdeElement(doc, order, isProd, serie, nNF));

            // <emit>
            infNFe.appendChild(buildEmitElement(doc, configs));

            // <dest>
            infNFe.appendChild(buildDestElement(doc, order, isProd));

            // <det> - Itens (Produtos)
            int itemNum = 1;
            BigDecimal vProdTotal = BigDecimal.ZERO;

            for (OrderItemModel item : order.getItems()) {
                infNFe.appendChild(buildDetElement(doc, itemNum++, item));
                vProdTotal = vProdTotal.add(item.getTotalPrice());
            }

            // <total>
            infNFe.appendChild(buildTotalElement(doc, vProdTotal, order.getShippingCost()));

            // <transp>
            infNFe.appendChild(buildTranspElement(doc, order));

            // <pag>
            infNFe.appendChild(buildPagElement(doc, order));

            // Transforma o DOM num String XML final
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

            // Requisito SEFAZ para não quebrar na assinatura
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.setOutputProperty(OutputKeys.INDENT, "no");

            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(writer));

            String xmlContent = writer.getBuffer().toString();

            // Dispara validação XSD offline garantindo integridade
            // (Comentário: Isso garante que nunca passaremos um XML capenga para o Auth do
            // Sefaz)
            // xmlValidator.validate(xmlContent); // Descomentar quando termos os .xsd
            // físicos presentes na pasta resources.

            return xmlContent;

        } catch (Exception e) {
            throw new RuntimeException("Falha catastrófica ao mapear XML da NF-e para Pedido " + order.getId(), e);
        }
    }

    private Element buildIdeElement(Document doc, OrderModel order, boolean isProd, String serie, String nNF) {
        Element ide = doc.createElement("ide");

        ide.appendChild(createElementWithValue(doc, "cUF", "35")); // SP por padrão do Ateliê
        ide.appendChild(createElementWithValue(doc, "cNF", "12345678")); // Código numérico aleatório
        ide.appendChild(createElementWithValue(doc, "natOp", "Venda de Mercadoria"));
        ide.appendChild(createElementWithValue(doc, "mod", "55"));
        ide.appendChild(createElementWithValue(doc, "serie", serie));
        ide.appendChild(createElementWithValue(doc, "nNF", nNF));

        // Data timezone MOC - UTC-03:00 - Offset
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
        String formattedDate = formatter.format(order.getCreatedAt().atZone(ZoneId.of("America/Sao_Paulo")));

        ide.appendChild(createElementWithValue(doc, "dhEmi", formattedDate));
        ide.appendChild(createElementWithValue(doc, "tpNF", "1")); // 1 = Saída
        ide.appendChild(createElementWithValue(doc, "idDest", calculateIdDest(order.getShippingState())));
        ide.appendChild(createElementWithValue(doc, "cMunFG", "3550308")); // SP - Capital Município Fato Gerador
        ide.appendChild(createElementWithValue(doc, "tpImp", "1")); // Retrato
        ide.appendChild(createElementWithValue(doc, "tpEmis", "1")); // Normal
        ide.appendChild(createElementWithValue(doc, "tpAmb", isProd ? "1" : "2")); // 1=Produção, 2=Homologação
        ide.appendChild(createElementWithValue(doc, "finNFe", "1")); // Normal
        ide.appendChild(createElementWithValue(doc, "indFinal", "1")); // Consumidor final
        ide.appendChild(createElementWithValue(doc, "indPres", "2")); // Internet

        return ide;
    }

    private String calculateIdDest(String targetState) {
        if (targetState == null)
            return "1"; // Interna por segurança (Tributar max)
        return targetState.equalsIgnoreCase("SP") ? "1" : "2"; // 1 = Estadual, 2 = Interestadual
    }

    private Element buildEmitElement(Document doc, Map<String, String> configs) {
        Element emit = doc.createElement("emit");
        emit.appendChild(createElementWithValue(doc, "CNPJ", sanitizeDocument(configs.get("FISCAL_ISSUER_CNPJ"))));
        emit.appendChild(createElementWithValue(doc, "xNome", configs.get("FISCAL_ISSUER_NAME")));

        String taxRegime = configs.get("FISCAL_TAX_REGIME");
        String crt = "1"; // Default Simples
        if ("REGIME_NORMAL".equals(taxRegime))
            crt = "3";
        else if ("SIMPLES_EXCESSO_RECEITA".equals(taxRegime))
            crt = "2";

        emit.appendChild(createElementWithValue(doc, "CRT", crt));

        Element enderEmit = doc.createElement("enderEmit");
        enderEmit.appendChild(createElementWithValue(doc, "xLgr", configs.get("FISCAL_ADDRESS_STREET")));
        enderEmit.appendChild(createElementWithValue(doc, "nro", configs.get("FISCAL_ADDRESS_NUMBER")));

        String compl = configs.get("FISCAL_ADDRESS_COMPLEMENT");
        if (compl != null && !compl.isBlank()) {
            enderEmit.appendChild(createElementWithValue(doc, "xCpl", compl));
        }

        enderEmit.appendChild(createElementWithValue(doc, "xBairro", configs.get("FISCAL_ADDRESS_NEIGHBORHOOD")));
        enderEmit.appendChild(createElementWithValue(doc, "cMun", "3550308")); // IBGE SP
        enderEmit.appendChild(createElementWithValue(doc, "xMun", configs.get("FISCAL_ADDRESS_CITY")));
        enderEmit.appendChild(createElementWithValue(doc, "UF", configs.get("FISCAL_ADDRESS_STATE")));
        enderEmit.appendChild(createElementWithValue(doc, "CEP", sanitizeDocument(configs.get("FISCAL_ADDRESS_ZIP"))));

        String fone = configs.get("FISCAL_ISSUER_FONE"); // Opcional
        if (fone != null && !fone.isBlank()) {
            enderEmit.appendChild(createElementWithValue(doc, "fone", sanitizeDocument(fone)));
        }

        emit.appendChild(enderEmit);

        String ie = sanitizeDocument(configs.get("FISCAL_ISSUER_IE"));
        if (ie != null && !ie.isBlank()) {
            emit.appendChild(createElementWithValue(doc, "IE", ie));
        }

        return emit;
    }

    private Element buildDestElement(Document doc, OrderModel order, boolean isProd) {
        Element dest = doc.createElement("dest");

        String docSanitized = sanitizeDocument(order.getCustomerDocument());
        if (docSanitized.length() == 14) {
            dest.appendChild(createElementWithValue(doc, "CNPJ", docSanitized));
        } else {
            dest.appendChild(createElementWithValue(doc, "CPF",
                    docSanitized == null || docSanitized.isEmpty() ? "00000000000" : docSanitized));
        }

        // Homologation Recipient Name Safety
        String recipientName = order.getCustomerName() == null ? "CONSUMIDOR" : order.getCustomerName();
        if (!isProd) {
            recipientName = "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL";
        }
        dest.appendChild(createElementWithValue(doc, "xNome", recipientName));

        Element enderDest = doc.createElement("enderDest");
        enderDest.appendChild(createElementWithValue(doc, "xLgr",
                order.getShippingStreet() == null ? "NAO INFORMADO" : order.getShippingStreet()));
        enderDest.appendChild(createElementWithValue(doc, "nro",
                order.getShippingNumber() == null ? "S/N" : order.getShippingNumber()));
        enderDest.appendChild(createElementWithValue(doc, "xBairro",
                order.getShippingNeighborhood() == null ? "CENTRO" : order.getShippingNeighborhood()));
        enderDest.appendChild(createElementWithValue(doc, "cMun", "3550308")); // IBGE Dinâmico precisa de base, mock =
                                                                               // SP
        enderDest.appendChild(createElementWithValue(doc, "xMun",
                order.getShippingCity() == null ? "SAO PAULO" : order.getShippingCity()));
        enderDest.appendChild(
                createElementWithValue(doc, "UF", order.getShippingState() == null ? "SP" : order.getShippingState()));
        enderDest.appendChild(createElementWithValue(doc, "CEP", sanitizeDocument(order.getShippingZipCode())));
        dest.appendChild(enderDest);

        dest.appendChild(createElementWithValue(doc, "indIEDest", "9")); // Não Contribuinte

        return dest;
    }

    private Element buildDetElement(Document doc, int nItem, OrderItemModel item) {
        Element det = doc.createElement("det");
        det.setAttribute("nItem", String.valueOf(nItem));

        Element prod = doc.createElement("prod");

        String cleanId = item.getId().toString().substring(0, 8);
        prod.appendChild(createElementWithValue(doc, "cProd", cleanId));
        prod.appendChild(createElementWithValue(doc, "cEAN", "SEM GTIN"));
        prod.appendChild(createElementWithValue(doc, "xProd", item.getProductName()));

        String ncm = item.getProductNcm() != null ? item.getProductNcm() : "84713019"; // NCM Genérico Fallback
        prod.appendChild(createElementWithValue(doc, "NCM", ncm));
        prod.appendChild(createElementWithValue(doc, "CFOP", "5102")); // Venda dentro do estado, Simples Nacional
        prod.appendChild(createElementWithValue(doc, "uCom", "UN"));
        prod.appendChild(createElementWithValue(doc, "qCom", item.getQuantity().toString() + ".0000")); // MOC exige 4
                                                                                                        // casas
        prod.appendChild(createElementWithValue(doc, "vUnCom", formatMoney(item.getUnitPrice(), 10))); // Valor Unid,
                                                                                                       // precisao MOC
        prod.appendChild(createElementWithValue(doc, "vProd", formatMoney(item.getTotalPrice(), 2))); // Valor Total liq
        prod.appendChild(createElementWithValue(doc, "cEANTrib", "SEM GTIN"));
        prod.appendChild(createElementWithValue(doc, "uTrib", "UN"));
        prod.appendChild(createElementWithValue(doc, "qTrib", item.getQuantity().toString() + ".0000"));
        prod.appendChild(createElementWithValue(doc, "vUnTrib", formatMoney(item.getUnitPrice(), 10)));
        prod.appendChild(createElementWithValue(doc, "indTot", "1")); // Compõe valor total da NF

        det.appendChild(prod);

        // Impostos SIMPLES NACIONAL (CSOSN)
        Element imposto = doc.createElement("imposto");
        Element icms = doc.createElement("ICMS");
        Element icmsSn102 = doc.createElement("ICMSSN102"); // Sem permissão de crédito
        String origin = String.valueOf(item.getProductOrigin());
        icmsSn102.appendChild(createElementWithValue(doc, "orig", origin));
        icmsSn102.appendChild(createElementWithValue(doc, "CSOSN", "102"));
        icms.appendChild(icmsSn102);
        imposto.appendChild(icms);

        Element pis = doc.createElement("PIS");
        Element pisOutr = doc.createElement("PISOutr");
        pisOutr.appendChild(createElementWithValue(doc, "CST", "99"));
        pisOutr.appendChild(createElementWithValue(doc, "vBC", "0.00"));
        pisOutr.appendChild(createElementWithValue(doc, "pPIS", "0.00"));
        pisOutr.appendChild(createElementWithValue(doc, "vPIS", "0.00"));
        pis.appendChild(pisOutr);
        imposto.appendChild(pis);

        Element cofins = doc.createElement("COFINS");
        Element cofinsOutr = doc.createElement("COFINSOutr");
        cofinsOutr.appendChild(createElementWithValue(doc, "CST", "99"));
        cofinsOutr.appendChild(createElementWithValue(doc, "vBC", "0.00"));
        cofinsOutr.appendChild(createElementWithValue(doc, "pCOFINS", "0.00"));
        cofinsOutr.appendChild(createElementWithValue(doc, "vCOFINS", "0.00"));
        cofins.appendChild(cofinsOutr);
        imposto.appendChild(cofins);

        det.appendChild(imposto);

        return det;
    }

    private Element buildTotalElement(Document doc, BigDecimal vProdTotal, BigDecimal shippingCost) {
        Element total = doc.createElement("total");
        Element icmsTot = doc.createElement("ICMSTot");

        icmsTot.appendChild(createElementWithValue(doc, "vBC", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vICMS", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vICMSDeson", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vFCP", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vBCST", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vST", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vFCPST", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vFCPSTRet", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vProd", formatMoney(vProdTotal, 2)));

        BigDecimal sf = shippingCost != null ? shippingCost : BigDecimal.ZERO;
        icmsTot.appendChild(createElementWithValue(doc, "vFrete", formatMoney(sf, 2)));

        icmsTot.appendChild(createElementWithValue(doc, "vSeg", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vDesc", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vII", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vIPI", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vIPIDevol", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vPIS", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vCOFINS", "0.00"));
        icmsTot.appendChild(createElementWithValue(doc, "vOutro", "0.00"));

        BigDecimal vNF = vProdTotal.add(sf); // Total Produtos + Frete
        icmsTot.appendChild(createElementWithValue(doc, "vNF", formatMoney(vNF, 2)));

        total.appendChild(icmsTot);
        return total;
    }

    private Element buildTranspElement(Document doc, OrderModel order) {
        Element transp = doc.createElement("transp");

        // 0-Contratacao Frete Remetente (CIF), 1-Destinatario (FOB), 9-Sem Frete
        String indFrete = (order.getShippingCost() != null && order.getShippingCost().compareTo(BigDecimal.ZERO) > 0)
                ? "0"
                : "9";
        transp.appendChild(createElementWithValue(doc, "modFrete", indFrete));

        return transp;
    }

    private Element buildPagElement(Document doc, OrderModel order) {
        Element pag = doc.createElement("pag");
        Element detPag = doc.createElement("detPag");
        detPag.appendChild(createElementWithValue(doc, "indPag", "0")); // A vista
        detPag.appendChild(createElementWithValue(doc, "tPag", "99")); // Outros (Gateway intermediário)
        detPag.appendChild(createElementWithValue(doc, "vPag", formatMoney(order.getTotalAmount(), 2)));
        pag.appendChild(detPag);
        return pag;
    }

    // -- Utilities --

    private Element createElementWithValue(Document doc, String tagName, String value) {
        Element element = doc.createElement(tagName);
        element.appendChild(doc.createTextNode(value));
        return element;
    }

    private String formatMoney(BigDecimal value, int decimalScale) {
        if (value == null)
            value = BigDecimal.ZERO;
        // Ponto decimal rigoroso SEFAZ
        return value.setScale(decimalScale, RoundingMode.HALF_EVEN).toPlainString();
    }

    private String sanitizeDocument(String docString) {
        if (docString == null)
            return "00000000000000";
        String sanitized = docString.replaceAll("[^0-9]", "");
        return sanitized.isEmpty() ? "00000000000000" : sanitized;
    }

    private String generateChaveAcesso(OrderModel order, Map<String, String> configs, boolean isProd, String serie,
            String nNF) {
        // UF(2) + AAMM(4) + CNPJ(14) + MOD(2) + SERIE(3) + NUM(9) + tpEmis(1) + cNF(8)
        // + cDV(1)
        String cUF = "35";
        DateTimeFormatter aaMM = DateTimeFormatter.ofPattern("yyMM");
        String data = aaMM.format(order.getCreatedAt().atZone(ZoneId.of("America/Sao_Paulo")));
        String cnpj = sanitizeDocument(configs.get("FISCAL_ISSUER_CNPJ"));
        String mod = "55";
        String ser = String.format("%03d", Integer.parseInt(serie));
        String num = String.format("%09d", Integer.parseInt(nNF));
        String tpEmis = "1";
        String cNF = "12345678"; // Em produção real deve ser randômico fixo por nota

        String base = cUF + data + String.format("%014d", Long.parseLong(cnpj)) + mod + ser + num + tpEmis + cNF;

        // Cálculo do DV (Módulo 11)
        int dv = calculateDV(base);

        return base + dv;
    }

    private int calculateDV(String chave) {
        int peso = 2;
        int soma = 0;
        for (int i = chave.length() - 1; i >= 0; i--) {
            soma += Character.getNumericValue(chave.charAt(i)) * peso;
            peso++;
            if (peso > 9)
                peso = 2;
        }
        int resto = soma % 11;
        return (resto == 0 || resto == 1) ? 0 : (11 - resto);
    }
}
