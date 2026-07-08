package gob.imss.gestor_productos.controller;

import gob.imss.gestor_productos.service.ExcelReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/v1/reportes")
public class ReporteController {

    @Autowired
    private ExcelReportService reportService;

    @GetMapping("/reclamos/excel")
    public ResponseEntity<InputStreamResource> descargarExcelReclamos() {
        try {
            ByteArrayInputStream stream = reportService.generarReporteReclamos();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=reporte_reclamos.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(stream));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}