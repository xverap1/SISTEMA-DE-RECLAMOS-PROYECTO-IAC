package gob.imss.gestor_productos.controller;

import gob.imss.gestor_productos.model.dto.ClienteRegistroDto;
import gob.imss.gestor_productos.model.dto.LoginResponse;
import gob.imss.gestor_productos.service.AuthService;
import gob.imss.gestor_productos.model.dto.LoginRequest;
import gob.imss.gestor_productos.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200/")
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/v1/auth/login
     * Endpoint desacoplado que delega la lógica de autenticación al Service.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            // El controlador solo delega y responde un 200 OK
            LoginResponse loginResult = authService.login(loginRequest);
            return new ResponseEntity<>(loginResult, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            // Captura el error de credenciales inválidas y responde un 401 Unauthorized
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Credenciales inválidas");
            errorResponse.put("mensaje", e.getMessage());

            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/registrar-cliente")
    public ResponseEntity<?> registrarCliente(@Valid @RequestBody ClienteRegistroDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.registrarNuevoCliente(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar el registro del cliente.");
        }
    }
}