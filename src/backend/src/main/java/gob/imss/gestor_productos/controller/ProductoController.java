package gob.imss.gestor_productos.controller;

import gob.imss.gestor_productos.model.Producto;
import gob.imss.gestor_productos.model.dto.ReporteResponseDto;
import gob.imss.gestor_productos.service.ProductoService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200/")
@RequestMapping("/api/v1/productos")
public class ProductoController {

    private final ProductoService productoService;
    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);

    // Inyección de dependencias por constructor (Mantenemos la buena práctica)
    @Autowired
    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    /**
     * POST /api/v1/productos
     * Registra un nuevo producto en el sistema.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        try {
            Producto nuevoProducto = productoService.registrarProducto(producto);
            // Retornamos un estado 201 Created junto con el objeto guardado (ya incluirá su ID y Folio)
            return new ResponseEntity<>(nuevoProducto, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Si la clave ya existe (regla de negocio), retornamos un 400 Bad Request
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * GET /api/v1/productos
     * Recupera la lista completa de productos.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'GUEST')")
    @GetMapping
    @CircuitBreaker(name = "productosCB", fallbackMethod = "metodoDeEmergencia")
    public ResponseEntity<List<Producto>> listarProductos() {
        List<Producto> productos = productoService.listarTodos();
        if (productos.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        return new ResponseEntity<>(productos, HttpStatus.OK); // 200 OK
    }

    /**
     * GET /api/v1/productos/folio/{folioNegocio}
     * Busca un producto específico mediante su identificador de negocio.
     */
    @GetMapping("/folio/{folioNegocio}")
    public ResponseEntity<Producto> obtenerPorFolio(@PathVariable String folioNegocio) {
        return productoService.buscarPorFolio(folioNegocio)
                .map(producto -> new ResponseEntity<>(producto, HttpStatus.OK)) // 200 OK si lo encuentra
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND)); // 404 Not Found si no existe
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto productoDetalles) {
        try {
            // Invocamos al servicio para procesar la actualización en MariaDB
            Producto productoActualizado = productoService.actualizarProducto(id, productoDetalles);

            // Retornamos 200 OK junto con el producto modificado para que Angular refresque la vista
            return new ResponseEntity<>(productoActualizado, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Si el ID del producto no existe en la base de datos, retornamos un 404 Not Found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * PATCH /api/v1/productos/{id}/desactivar
     * Realiza la baja lógica (cambio de vigencia) de un producto.
     * Usamos una variable en los parámetros de la petición (Query Param) para capturar al usuario auditor.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<String> desactivarProducto(
            @PathVariable Long id,
            @RequestParam String usuarioAuditor) {
        try {
            productoService.desactivarProducto(id, usuarioAuditor);
            return new ResponseEntity<>("Producto desactivado exitosamente.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<List<Producto>> metodoDeEmergencia(Throwable t) {
        logger.error("=== CIRCUIT BREAKER ACTIVADO ===");
        logger.error("La base de datos o el servicio no responden. Causa: " + t.getMessage());

        // Creamos una respuesta de respaldo limpia (lista vacía)
        List<Producto> productosRespaldo = new ArrayList<>();

        // Retornamos un 200 OK con la lista vacía para que Angular no truene,
        // solo pintará la tabla vacía con el mensaje de "No hay coincidencias" que programamos ayer.
        return new ResponseEntity<>(productosRespaldo, HttpStatus.OK);
    }

    /**
     * POST /api/v1/productos/exportar
     * Genera el Excel en memoria filtrado y lo retorna envuelto en JSON Base64.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'GUEST')")
    @PostMapping("/exportar")
    public ResponseEntity<ReporteResponseDto> exportarProductosAExcel(@RequestBody List<Producto> productosFiltrados) {
        // Invocamos al servicio pasándole la lista actual que tiene el usuario filtrada en su pantalla
        ReporteResponseDto response = productoService.generarReporteProductosExcel(productosFiltrados);

        // Retornamos el JSON con un estatus 200 OK tradicional
        return ResponseEntity.ok(response);
    }
}