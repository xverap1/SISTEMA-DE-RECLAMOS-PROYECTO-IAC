package gob.imss.gestor_productos.service;


import gob.imss.gestor_productos.model.Reclamo;
import gob.imss.gestor_productos.repository.ReclamoRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ExcelReportService {

    @Autowired
    private ReclamoRepository reclamoRepository;

    public ByteArrayInputStream generarReporteReclamos() throws IOException {
        List<Reclamo> reclamos = reclamoRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bandeja de Reclamos");
            sheet.setDisplayGridlines(true); // Cuadrícula visible

            // --- DISEÑO DE FUENTES Y PALETAS ---
            Font fontHeader = workbook.createFont();
            fontHeader.setFontName("Segoe UI");
            fontHeader.setBold(true);
            fontHeader.setColor(IndexedColors.WHITE.getIndex());

            CellStyle styleHeader = workbook.createCellStyle();
            styleHeader.setFont(fontHeader);
            // Color Azul Pizarra (#2C3E50) para la cabecera corporativa
            styleHeader.setFillForegroundColor(IndexedColors.BLUE_GREY.getIndex());
            styleHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            styleHeader.setAlignment(HorizontalAlignment.CENTER);
            styleHeader.setBorderBottom(BorderStyle.THIN);

            // --- CABECERAS DE LA TABLA ---
            String[] columnas = {
                    "ID TICKET", "FECHA REGISTRO", "ANTIGÜEDAD",
                    "USUARIO CREÓ", "ASUNTO",
                    "ESTADO", "USUARIO RESOLVIÓ", "DICTAMEN FINAL"
            };

            // Fila de inicio de la tabla (dejando espacio para títulos superiores)
            Row rowHeader = sheet.createRow(4);
            for (int i = 0; i < columnas.length; i++) {
                Cell cell = rowHeader.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(styleHeader);
            }

            // --- LLENADO DE DATOS DESDE ARREGLO/MARIADB ---
            // Formateador para que la fecha no se vea fea en el Excel
            DateTimeFormatter formateador = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a");
            LocalDateTime hoy = LocalDateTime.now();
            int initRow = 5;
            CellStyle styleBody = workbook.createCellStyle();
            styleBody.setBorderBottom(BorderStyle.THIN);
            styleBody.setBorderLeft(BorderStyle.THIN);
            styleBody.setBorderRight(BorderStyle.THIN);
            styleBody.setBorderTop(BorderStyle.THIN);

            for (Reclamo rec : reclamos) {
                Row row = sheet.createRow(initRow++);

                row.createCell(0).setCellValue(rec.getId());
                String fechaFormateada = rec.getFechaRegistro() != null ? rec.getFechaRegistro().format(formateador) : "--";
                row.createCell(1).setCellValue(fechaFormateada);

                if (rec.getFechaRegistro() != null && "ABIERTO".equals(rec.getEstadoTicket())) {
                    // Si está abierto, calculamos los días transcurridos contra hoy
                    long dias = ChronoUnit.DAYS.between(rec.getFechaRegistro(), hoy);
                    row.createCell(2).setCellValue(dias + " días");
                } else if ("RESUELTO".equals(rec.getEstadoTicket())) {
                    // Si ya está resuelto, el ticket ya no acumula antigüedad activa
                    row.createCell(2).setCellValue("Cerrado");
                } else {
                    row.createCell(2).setCellValue("0 días");
                }

                //row.createCell(3).setCellValue(rec.getFolioReferencia());
                row.createCell(3).setCellValue(rec.getUsuarioCreo());
                //row.createCell(4).setCellValue(rec.getTipoReclamo());
                row.createCell(4).setCellValue(rec.getAsunto());
                //row.createCell(5).setCellValue("prioridad");
                row.createCell(5).setCellValue(rec.getEstadoTicket());
                row.createCell(6).setCellValue(rec.getUsuarioResolvio() != null ? rec.getUsuarioResolvio() : "--");
                row.createCell(7).setCellValue(rec.getRespuestaSoporte() != null ? rec.getRespuestaSoporte() : "");

                // Aplicar bordes generales a la fila de datos
                for (int j = 0; j < columnas.length; j++) {
                    row.getCell(j).setCellStyle(styleBody);
                }
            }

            // Autoajustar anchos
            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}