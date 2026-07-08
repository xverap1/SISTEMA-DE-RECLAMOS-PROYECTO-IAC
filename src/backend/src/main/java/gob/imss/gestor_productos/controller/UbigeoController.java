package gob.imss.gestor_productos.controller;

import gob.imss.gestor_productos.model.dto.UbigeoDto;
import gob.imss.gestor_productos.service.UbigeoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ubigeos")
@CrossOrigin(origins = "*") // Para evitar problemas de CORS durante tus pruebas locales
public class UbigeoController {

    @Autowired
    private UbigeoService ubigeoService;

    /**
     * GET /api/v1/ubigeos/departamentos
     */
    @PreAuthorize("isAuthenticated()") // Permite que cualquier usuario logueado con JWT acceda al catálogo
    @GetMapping("/departamentos")
    public ResponseEntity<List<UbigeoDto>> getDepartamentos() {
        return ResponseEntity.ok(ubigeoService.obtenerDepartamentos());
    }

    /**
     * GET /api/v1/ubigeos/provincias/{depId}
     * Ej: /api/v1/ubigeos/provincias/15
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/provincias/{depId}")
    public ResponseEntity<List<UbigeoDto>> getProvincias(@PathVariable String depId) {
        return ResponseEntity.ok(ubigeoService.obtenerProvincias(depId));
    }

    /**
     * GET /api/v1/ubigeos/distritos/{provId}
     * Ej: /api/v1/ubigeos/distritos/1501
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/distritos/{provId}")
    public ResponseEntity<List<UbigeoDto>> getDistritos(@PathVariable String provId) {
        return ResponseEntity.ok(ubigeoService.obtenerDistritos(provId));
    }
}