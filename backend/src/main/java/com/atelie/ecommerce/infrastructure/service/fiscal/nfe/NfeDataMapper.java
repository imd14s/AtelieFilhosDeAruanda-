package com.atelie.ecommerce.infrastructure.service.fiscal.nfe;

import com.atelie.ecommerce.domain.fiscal.nfe.NfeXmlGeneratorPort;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemEntity;
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

/**
 * Motor de mapeamento e serialização de dados de Negócio para o formato SEFAZ
 * NF-e 4.00.
 */
@Component
public class NfeDataMapper implements NfeXmlGeneratorPort {

    private final NfeXmlValidator xmlValidator;

    public NfeDataMapper(NfeXmlValidator xmlValidator) {
        this.xmlValidator = xmlValidator;
    }

    @Override
    public String generateXmlFor(OrderEntity order) {
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

            // <infNFe> : Chave deve ser gerada/mockada com a lógica real da Sefaz depois
            // (UF+AAMM+CNPJ+MOD+SERIE+NUM+TIPO_EMISSAO+COD_NUM+DV)
            Element infNFe = doc.createElement("infNFe");
            infNFe.setAttribute("Id", "NFe" + generateMockChaveAcesso());
            infNFe.setAttribute("versao", "4.00");
            nfeElement.appendChild(infNFe);

            // <ide>
            infNFe.appendChild(buildIdeElement(doc, order));

            // <emit>
            infNFe.appendChild(buildEmitElement(doc));

            // <dest>
            infNFe.appendChild(buildDestElement(doc, order));

            // <det> - Itens (Produtos)
            int itemNum = 1;
            BigDecimal vProdTotal = BigDecimal.ZERO;

            for (OrderItemEntity item : order.getItems()) {
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

    private Element buildIdeElement(Document doc, OrderEntity order) {
        Element ide = doc.createElement("ide");

        ide.appendChild(createElementWithValue(doc, "cUF", "35")); // SP por padrão do Ateliê
        ide.appendChild(createElementWithValue(doc, "cNF", "12345678")); // Exemplo
        ide.appendChild(createElementWithValue(doc, "natOp", "Venda de Mercadoria"));
        ide.appendChild(createElementWithValue(doc, "mod", "55"));
        ide.appendChild(createElementWithValue(doc, "serie", "1"));
        ide.appendChild(createElementWithValue(doc, "nNF", "1234")); // Número sequencial controle

        // Data timezone MOC - UTC-03:00 - Offset
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
        String formattedDate = formatter.format(order.getCreatedAt().atZone(ZoneId.of("America/Sao_Paulo")));

        ide.appendChild(createElementWithValue(doc, "dhEmi", formattedDate));
        ide.appendChild(createElementWithValue(doc, "tpNF", "1")); // 1 = Saída
        ide.appendChild(createElementWithValue(doc, "idDest", calculateIdDest(order.getShippingState())));
        ide.appendChild(createElementWithValue(doc, "cMunFG", "3550308")); // SP - Capital Município Fato Gerador
        ide.appendChild(createElementWithValue(doc, "tpImp", "1")); // Retrato
        ide.appendChild(createElementWithValue(doc, "tpEmis", "1")); // Normal
        ide.appendChild(createElementWithValue(doc, "tpAmb", "2")); // 2=Homologação, 1=Produção
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

    private Element buildEmitElement(Document doc) {
        Element emit = doc.createElement("emit");
        emit.appendChild(createElementWithValue(doc, "CNPJ", "12345678000195")); // CNPJ Base Ateliê Mock
        emit.appendChild(createElementWithValue(doc, "xNome", "Ateliê Filhos de Aruanda LTDA"));
        emit.appendChild(createElementWithValue(doc, "CRT", "1")); // Simples Nacional

        Element enderEmit = doc.createElement("enderEmit");
        enderEmit.appendChild(createElementWithValue(doc, "xLgr", "Rua do Comércio"));
        enderEmit.appendChild(createElementWithValue(doc, "nro", "123"));
        enderEmit.appendChild(createElementWithValue(doc, "xBairro", "Centro"));
        enderEmit.appendChild(createElementWithValue(doc, "cMun", "3550308"));
        enderEmit.appendChild(createElementWithValue(doc, "xMun", "São Paulo"));
        enderEmit.appendChild(createElementWithValue(doc, "UF", "SP"));
        enderEmit.appendChild(createElementWithValue(doc, "CEP", "01000000"));
        enderEmit.appendChild(createElementWithValue(doc, "fone", "11999999999"));
        emit.appendChild(enderEmit);

        return emit;
    }

    private Element buildDestElement(Document doc, OrderEntity order) {
        Element dest = doc.createElement("dest");

        String docSanitized = sanitizeDocument(order.getCustomerDocument());
        if (docSanitized.length() == 14) {
            dest.appendChild(createElementWithValue(doc, "CNPJ", docSanitized));
        } else {
            dest.appendChild(createElementWithValue(doc, "CPF",
                    docSanitized == null || docSanitized.isEmpty() ? "00000000000" : docSanitized));
        }

        dest.appendChild(createElementWithValue(doc, "xNome",
                order.getCustomerName() == null ? "CONSUMIDOR" : order.getCustomerName()));

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

    private Element buildDetElement(Document doc, int nItem, OrderItemEntity item) {
        Element det = doc.createElement("det");
        det.setAttribute("nItem", String.valueOf(nItem));

        Element prod = doc.createElement("prod");

        String cleanId = item.getProduct() != null ? item.getProduct().getId().toString().substring(0, 8)
                : UUID.randomUUID().toString().substring(0, 8);
        prod.appendChild(createElementWithValue(doc, "cProd", cleanId));
        prod.appendChild(createElementWithValue(doc, "cEAN", "SEM GTIN"));
        prod.appendChild(createElementWithValue(doc, "xProd", item.getProductName()));

        String ncm = item.getProduct() != null && item.getProduct().getNcm() != null ? item.getProduct().getNcm()
                : "84713019"; // NCM Genérico Fallback
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
        String origin = item.getProduct() != null && item.getProduct().getOrigin() != null
                ? String.valueOf(item.getProduct().getOrigin().ordinal())
                : "0";
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

    private Element buildTranspElement(Document doc, OrderEntity order) {
        Element transp = doc.createElement("transp");

        // 0-Contratacao Frete Remetente (CIF), 1-Destinatario (FOB), 9-Sem Frete
        String indFrete = (order.getShippingCost() != null && order.getShippingCost().compareTo(BigDecimal.ZERO) > 0)
                ? "0"
                : "9";
        transp.appendChild(createElementWithValue(doc, "modFrete", indFrete));

        return transp;
    }

    private Element buildPagElement(Document doc, OrderEntity order) {
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
            return "";
        return docString.replaceAll("[^0-9]", "");
    }

    private String generateMockChaveAcesso() {
        return "35" + "2602" + "12345678000195" + "55" + "001" + "000001234" + "1" + "10203040" + "5";
    }
}
