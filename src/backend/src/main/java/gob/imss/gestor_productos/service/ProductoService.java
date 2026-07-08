package gob.imss.gestor_productos.service;


import gob.imss.gestor_productos.model.Producto;
import gob.imss.gestor_productos.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gob.imss.gestor_productos.model.dto.ReporteResponseDto;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.List;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    // Inyección por constructor (Buena práctica recomendada)
    @Autowired
    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    /**
     * Guarda un nuevo producto aplicando reglas de negocio básicas.
     */
    @Transactional
    public Producto registrarProducto(Producto producto) {
        // Regla de Negocio: No pueden existir dos productos con la misma clave
        if (productoRepository.existsByClaveProducto(producto.getClaveProducto())) {
            throw new IllegalArgumentException("La clave de producto '" + producto.getClaveProducto() + "' ya está registrada.");
        }

        // Guardamos el producto original en MariaDB
        Producto nuevoProducto = productoRepository.save(producto);

        auditoriaService.registrarMovimiento(
                nuevoProducto,
                nuevoProducto.getUsuarioAuditor(),
                "CREACIÓN",
                "Se dio de alta el producto en el catálogo institucional con un costo de $" + nuevoProducto.getPrecio()
        );

        // El folio de negocio y la fecha se autogeneran en la entidad gracias al @PrePersist
        return nuevoProducto;
    }

    /**
     * Obtiene todos los productos registrados.
     */
    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    /**
     * Busca un producto por su folio de negocio único.
     */
    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorFolio(String folioNegocio) {
        return productoRepository.findByFolioNegocio(folioNegocio);
    }

    /**
     * Desactiva un producto (Baja lógica).
     * En sistemas bancarios o empresariales, los registros casi nunca se borran físicamente (DELETE),
     * sino que se cambia su estado de vigencia a inactivo.
     */
    @Transactional
    public void desactivarProducto(Long id, String usuarioAuditor) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el ID: " + id));

        producto.setActivo(false);
        producto.setUsuarioAuditor(usuarioAuditor); // Se registra quién hizo el cambio

        Producto productoInactivado = productoRepository.save(producto);
        auditoriaService.registrarMovimiento(
                productoInactivado,
                usuarioAuditor,
                "DESACTIVACIÓN",
                "El usuario aplicó la baja lógica del insumo. El registro pasó a estado INACTIVO."
        );

        //productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizarProducto(Long id, Producto productoDetalles) {
        // 1. Buscamos el producto real en la base de datos MariaDB
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El producto con ID " + id + " no existe."));

        // Guardamos una referencia del precio anterior para documentar el cambio exacto en la bitácora
        BigDecimal precioAnterior = productoExistente.getPrecio();

        // 2. Actualizamos únicamente los campos permitidos por el formulario
        productoExistente.setNombreProducto(productoDetalles.getNombreProducto());
        productoExistente.setPrecio(productoDetalles.getPrecio());

        // 💡 NOTA DE AUDITORÍA: La clave del producto la deshabilitamos en el front,
        // pero por seguridad en el backend ignoramos cualquier intento de modificarla
        // o de alterar la fecha de registro original.

        // 3. Guardamos los cambios (Spring Data JPA sincronizará los cambios automáticamente con MariaDB)
        productoExistente.setUsuarioAuditor(productoDetalles.getUsuarioAuditor());

        Producto productoActualizado = productoRepository.save(productoExistente);

        String detalleCambio = "Se actualizaron las especificaciones del artículo. ";
        if (!precioAnterior.equals(productoActualizado.getPrecio())) {
            detalleCambio += "Modificación de costos: de $" + precioAnterior + " a $" + productoActualizado.getPrecio();
        }

        auditoriaService.registrarMovimiento(
                productoActualizado,
                productoActualizado.getUsuarioAuditor(),
                "MODIFICACIÓN",
                detalleCambio
        );


        return productoActualizado;
    }

    public ReporteResponseDto generarReporteProductosExcel(List<Producto> productosFiltrados) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            // 1. Creamos la hoja de Excel y su estructura (Tu lógica actual de Apache POI)
            Sheet sheet = workbook.createSheet("Productos");

            CellStyle estiloFecha = workbook.createCellStyle();
            CreationHelper creationHelper = workbook.getCreationHelper();
            estiloFecha.setDataFormat(creationHelper.createDataFormat().getFormat("dd/mm/yyyy"));

            // Fila de encabezados
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Folio de Negocio");
            headerRow.createCell(1).setCellValue("Clave");
            headerRow.createCell(2).setCellValue("Descripción del Producto");
            headerRow.createCell(3).setCellValue("Precio");
            headerRow.createCell(4).setCellValue("Estatus");
            headerRow.createCell(5).setCellValue("Fecha de Registro");
            headerRow.createCell(6).setCellValue("Auditor");


            // Llenamos el Excel con la lista de productos filtrados que nos mande el Front
            int rowIdx = 1;
            for (Producto prod : productosFiltrados) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(prod.getFolioNegocio());
                row.createCell(1).setCellValue(prod.getClaveProducto());
                row.createCell(2).setCellValue(prod.getNombreProducto());
                row.createCell(3).setCellValue(prod.getPrecio().toString());
                row.createCell(4).setCellValue(prod.getActivo()?"ACTIVO":"INACTIVO");
                Cell celdaFecha = row.createCell(5);
                celdaFecha.setCellValue(prod.getFechaRegistro());
                celdaFecha.setCellStyle(estiloFecha);
                row.createCell(6).setCellValue(prod.getUsuarioAuditor());
            }

            // 2. 🌟 EL TRUCO EN MEMORIA: Escribimos el libro de Excel en nuestro flujo de bytes (RAM)
            workbook.write(baos);
            byte[] excelBytes = baos.toByteArray();

            // 3. CONVERSIÓN A BASE64: Convertimos los bytes binarios a texto seguro
            String excelBase64 = Base64.getEncoder().encodeToString(excelBytes);

            // 4. Armamos el DTO final con el diseño exacto del documento
            return new ReporteResponseDto(
                    200,
                    "Reporte generado correctamente",
                    "productos.xlsx",
                    excelBase64
            );

        } catch (Exception e) {
            throw new RuntimeException("Error fatal al generar el archivo Excel en memoria: " + e.getMessage());
        }
    }
}