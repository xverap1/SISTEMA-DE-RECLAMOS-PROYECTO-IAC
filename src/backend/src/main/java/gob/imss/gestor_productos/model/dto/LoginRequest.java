package gob.imss.gestor_productos.model.dto;

/**
 * DTO para capturar las credenciales de inicio de sesión del cliente.
 */
public record LoginRequest(String usuario, String contrasena) {}