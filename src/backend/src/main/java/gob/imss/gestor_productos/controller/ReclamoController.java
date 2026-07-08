package gob.imss.gestor_productos.controller;

import gob.imss.gestor_productos.model.Reclamo;
import gob.imss.gestor_productos.model.dto.ResolucionReclamoDto;
import gob.imss.gestor_productos.service.ReclamoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reclamos")
public class ReclamoController {

    @Autowired
    private ReclamoService reclamoService;

    /**
     * POST /api/v1/reclamos
     * Registra un nuevo ticket de queja en la plataforma.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'GUEST')")
    @PostMapping
    public ResponseEntity<?> crearReclamo(@RequestBody Reclamo reclamo, Principal principal) {
        try {
            // Extraemos automáticamente el nombre de usuario autenticado en el JWT (gracias a tu JwtFilter)
            String usuarioEnSesion = (principal != null) ? principal.getName() : "anonimo.dev";

            Reclamo nuevoReclamo = reclamoService.guardarReclamo(reclamo, usuarioEnSesion);
            return new ResponseEntity<>(nuevoReclamo, HttpStatus.CREATED); // 210 Created
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al levantar el ticket de reclamo: " + e.getMessage());
        }
    }

    // 🌟 Añade este método en ReclamoController.java

    /**
     * PUT /api/v1/reclamos/{id}/resolver
     * Endpoint exclusivo para que el Administrador responda y cierre un reclamo.
     */
    @PreAuthorize("hasRole('ADMIN')") // 🛡️ CANDADO DE SEGURIDAD EXCLUSIVO
    @PutMapping("/{id}/resolver")
    public ResponseEntity<?> resolverTicket(
            @PathVariable Long id,
            @Valid @RequestBody ResolucionReclamoDto resolucionDto,
            Principal principal) {
        try {
            String usuarioAdmin = principal.getName(); // Obtenido de forma segura desde el JWT
            Reclamo reclamoResuelto = reclamoService.resolverReclamo(id, resolucionDto, usuarioAdmin);
            return ResponseEntity.ok(reclamoResuelto);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al procesar la resolución del reclamo.");
        }
    }

    @PreAuthorize("hasRole('ADMIN')") // 🛡️ Candado de seguridad estricto
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Reclamo reclamoResuelto = reclamoService.obtenerReclamoPorId(id);
            return ResponseEntity.ok(reclamoResuelto);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al procesar la resolución del reclamo.");
        }
    }

    @PreAuthorize("hasRole('ADMIN')") // 🛡️ Candado de seguridad estricto para que solo el Admin lo vea
    @GetMapping
    public ResponseEntity<List<Reclamo>> listarTodosLosReclamos() {
        try {
            List<Reclamo> reclamos = reclamoService.obtenerTodosLosReclamos();
            return ResponseEntity.ok(reclamos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null); // O un mensaje de error estructurado
        }
    }
}