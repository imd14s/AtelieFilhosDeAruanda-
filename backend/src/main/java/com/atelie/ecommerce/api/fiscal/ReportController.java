package com.atelie.ecommerce.api.fiscal;

import com.atelie.ecommerce.application.service.fiscal.ReportService;
import com.atelie.ecommerce.domain.fiscal.model.GeneratedReport;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/export")
    public ResponseEntity<GeneratedReport> export(@RequestParam String type, @RequestParam String period) {
        // TODO: Get authenticated user ID
        UUID userId = UUID.randomUUID();
        GeneratedReport report = reportService.requestReport(type, period, userId);
        return ResponseEntity.accepted().body(report);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<GeneratedReport> getStatus(@PathVariable UUID id) {
        GeneratedReport report = reportService.getById(id);
        if (report == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable UUID id) throws Exception {
        GeneratedReport report = reportService.getById(id);
        if (report == null || report.getStatus() != GeneratedReport.ReportStatus.COMPLETED) {
            return ResponseEntity.notFound().build();
        }

        byte[] content = reportService.getFileContent(id);
        String contentType = "CSV".equalsIgnoreCase(report.getReportType()) ? "text/csv" : "application/pdf";
        String filename = "report-" + id + ("CSV".equalsIgnoreCase(report.getReportType()) ? ".csv" : ".pdf");

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(content);
    }
}
