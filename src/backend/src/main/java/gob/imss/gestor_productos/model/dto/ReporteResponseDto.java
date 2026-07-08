package gob.imss.gestor_productos.model.dto;

/**
 * DTO que cumple estrictamente con el estándar institucional
 * para la transferencia segura de archivos en Base64.
 */
public record ReporteResponseDto(
        int status,
        String message,
        String fileName,
        String fileBase64
) {}