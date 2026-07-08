package gob.imss.gestor_productos.model.dto;

/**
 * DTO para enviar la respuesta del inicio de sesión exitoso.
 * Al usar 'record', Java genera automáticamente los getters inmutables.
 */
public record LoginResponse(
        String access_token,
        String username,
        String nombreCompleto,
        String area,
        String rol,
        String nombreSupervisor
) {}