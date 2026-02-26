package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.application.service.fiscal.InvoiceService;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    public AdminOrderController(OrderService orderService, InvoiceService invoiceService) {
        this.orderService = orderService;
        this.invoiceService = invoiceService;
    }

    @PostMapping("/{id}/invoice")
    public ResponseEntity<Void> emitInvoice(@PathVariable UUID id) {
        invoiceService.emitInvoiceForOrder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/{id}/nfe/xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getXml(@PathVariable UUID id) {
        OrderEntity order = orderService.getOrderById(id);
        if (order.getNfeReceipt() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order.getNfeReceipt());
    }

    @GetMapping(value = "/{id}/nfe/danfe", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getDanfe(@PathVariable UUID id) {
        // Placeholder para DANFE - Futuramente integrar com Jasper ou outro
        // renderizador
        // Por ora, apenas informamos que não há PDF estático
        return ResponseEntity.status(501).build(); // Not Implemented
    }
}
