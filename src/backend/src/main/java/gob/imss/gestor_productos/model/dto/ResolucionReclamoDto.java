package gob.imss.gestor_productos.model.dto;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class ResolucionReclamoDto {
    @NotBlank(message = "La respuesta no puede estar vacía.")
    @Size(min = 15, max = 1000, message = "La respuesta debe tener entre 15 y 1000 caracteres.")
    private String respuestaSoporte;
}