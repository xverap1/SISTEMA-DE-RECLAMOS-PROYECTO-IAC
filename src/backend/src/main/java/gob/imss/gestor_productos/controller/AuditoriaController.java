package gob.imss.gestor_productos.controller;


import gob.imss.gestor_productos.model.AuditoriaProducto;
import gob.imss.gestor_productos.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auditoria")
public class AuditoriaController {

    @Autowired
    private AuditoriaService auditoriaService;

    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'GUEST')")
    @GetMapping("/historial")
    public ResponseEntity<List<AuditoriaProducto>> consultarHistorial() {
        return ResponseEntity.ok(auditoriaService.obtenerHistorialCompleto());
    }
}