package gob.imss.gestor_productos.model.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClienteRegistroDto {
    @NotBlank(message = "El nombre de usuario es requerido.")
    @Size(min = 4, max = 20)
    private String username;

    @NotBlank(message = "La contraseña es requerida.")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    private String password;

    @NotBlank(message = "El nombre completo es requerido.")
    private String nombre;

    @NotBlank(message = "El apellido paterno es requerido.")
    private String apellidoPaterno;

    @NotBlank(message = "El apellido materno es requerido.")
    private String apellidoMaterno;

    @NotBlank(message = "El correo electrónico es requerido.")
    @Email(message = "El formato de correo no es válido.")
    private String correo;

    @NotBlank(message = "El celular es requerido.")
    @Size(min = 9, max = 9)
    private String celular;

    @NotBlank(message = "La dirección es requerida.")
    @Size(min = 9)
    private String direccion;

    @NotBlank(message = "El dni es requerido.")
    @Size(min = 8, max = 8)
    private String dni;
}