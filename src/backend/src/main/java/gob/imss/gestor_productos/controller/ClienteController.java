package gob.imss.gestor_productos.controller;

import gob.imss.gestor_productos.model.Cliente;
import gob.imss.gestor_productos.model.Usuario;
import gob.imss.gestor_productos.model.dto.ClienteRegistroDto;
import gob.imss.gestor_productos.service.ClienteService;
import gob.imss.gestor_productos.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;


    /**
     * POST /api/v1/clientes
     * Endpoint protegido para registrar un nuevo cliente en el sistema.
     */
    //@PreAuthorize("hasAnyRole('ADMIN', 'USER')") // 🛡️ Bloquea accesos no autorizados mediante JWT
    @PostMapping
    public ResponseEntity<?> crearCliente(@RequestBody ClienteRegistroDto cliente) {
        try {
            Usuario nuevoCliente = clienteService.registrarNuevoCliente(cliente);

            return new ResponseEntity<>(nuevoCliente, HttpStatus.CREATED); // 201 Created
        } catch (IllegalArgumentException e) {
            // Manejo controlado en caso de que el correo electrónico ya exista
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno al procesar el alta del cliente.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}