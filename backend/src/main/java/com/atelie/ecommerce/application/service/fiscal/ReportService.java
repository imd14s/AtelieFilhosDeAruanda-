package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import com.atelie.ecommerce.domain.fiscal.model.GeneratedReport;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository;
import com.atelie.ecommerce.domain.fiscal.repository.GeneratedReportRepository;
import com.opencsv.CSVWriter;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final FinancialLedgerRepository ledgerRepository;
    private final GeneratedReportRepository reportRepository;
    private final ReportStorageService storageService;

    public GeneratedReport requestReport(String type, String period, UUID userId) {
        GeneratedReport report = GeneratedReport.builder()
                .id(UUID.randomUUID())
                .reportType(type)
                .period(period)
                .requestedAt(Instant.now())
                .status(GeneratedReport.ReportStatus.PENDING)
                .requestedBy(userId)
                .build();

        reportRepository.save(report);

        // Trigger generic async process
        processReportAsync(report.getId());

        return report;
    }

    @Async
    public void processReportAsync(UUID reportId) {
        GeneratedReport report = reportRepository.findById(reportId).orElse(null);
        if (report == null)
            return;

        try {
            updateStatus(reportId, GeneratedReport.ReportStatus.PROCESSING);

            byte[] content;
            String extension;
            if ("CSV".equalsIgnoreCase(report.getReportType())) {
                content = generateCsv(report.getPeriod());
                extension = "csv";
            } else {
                content = generatePdf(report.getPeriod());
                extension = "pdf";
            }

            String fileKey = storageService.save(content, reportId, extension);
            String url = "/api/reports/download/" + reportId;

            GeneratedReport completedReport = GeneratedReport.builder()
                    .id(report.getId())
                    .reportType(report.getReportType())
                    .period(report.getPeriod())
                    .requestedAt(report.getRequestedAt())
                    .completedAt(Instant.now())
                    .status(GeneratedReport.ReportStatus.COMPLETED)
                    .fileKey(fileKey)
                    .downloadUrl(url)
                    .requestedBy(report.getRequestedBy())
                    .build();

            reportRepository.save(completedReport);
            log.info("Relatório {} gerado com sucesso", reportId);

        } catch (Exception e) {
            log.error("Erro ao gerar relatório {}: {}", reportId, e.getMessage());
            updateStatus(reportId, GeneratedReport.ReportStatus.FAILED);
        }
    }

    public GeneratedReport getById(UUID id) {
        return reportRepository.findById(id).orElse(null);
    }

    public byte[] getFileContent(UUID id) throws Exception {
        GeneratedReport report = reportRepository.findById(id).orElseThrow();
        return storageService.load(report.getFileKey());
    }

    private void updateStatus(UUID id, GeneratedReport.ReportStatus status) {
        reportRepository.findById(id).ifPresent(r -> {
            GeneratedReport updated = GeneratedReport.builder()
                    .id(r.getId())
                    .reportType(r.getReportType())
                    .period(r.getPeriod())
                    .requestedAt(r.getRequestedAt())
                    .status(status)
                    .requestedBy(r.getRequestedBy())
                    .build();
            reportRepository.save(updated);
        });
    }

    private byte[] generateCsv(String period) throws Exception {
        int days = parsePeriod(period);
        Instant start = Instant.now().minus(days, java.time.temporal.ChronoUnit.DAYS);
        List<FinancialLedger> ledgers = ledgerRepository.findAllInPeriod(start, Instant.now());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(out));

        String[] header = { "Data", "ID Pedido", "Valor Bruto", "Taxas Gateway", "Frete", "Impostos", "CMV",
                "Lucro Líquido" };
        writer.writeNext(header);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.systemDefault());

        for (FinancialLedger l : ledgers) {
            writer.writeNext(new String[] {
                    fmt.format(l.getCreatedAt()),
                    l.getOrderId().toString(),
                    l.getGrossAmount().toString(),
                    l.getGatewayFee().toString(),
                    l.getShippingCost().toString(),
                    l.getTaxesAmount().toString(),
                    l.getProductCost().toString(),
                    l.getNetAmount().toString()
            });
        }

        writer.close();
        return out.toByteArray();
    }

    private byte[] generatePdf(String period) throws Exception {
        int days = parsePeriod(period);
        Instant start = Instant.now().minus(days, java.time.temporal.ChronoUnit.DAYS);
        List<FinancialLedger> ledgers = ledgerRepository.findAllInPeriod(start, Instant.now());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);

        document.open();
        document.add(new Paragraph("Relatório Financeiro - Ateliê Filhos de Aruanda"));
        document.add(new Paragraph("Período: " + period));
        document.add(new Paragraph("Gerado em: " + Instant.now().toString()));
        document.add(new Paragraph(" "));

        for (FinancialLedger l : ledgers) {
            document.add(new Paragraph(String.format("Pedido: %s | Bruto: R$ %s | Líquido: R$ %s",
                    l.getOrderId(), l.getGrossAmount(), l.getNetAmount())));
        }

        document.close();
        return out.toByteArray();
    }

    private int parsePeriod(String period) {
        if ("7d".equals(period))
            return 7;
        if ("90d".equals(period))
            return 90;
        return 30; // default
    }
}
