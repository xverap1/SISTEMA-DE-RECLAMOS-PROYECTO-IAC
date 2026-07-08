package gob.imss.gestor_productos.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UbigeoDto {
    private String codigo;
    private String nombre;

    public UbigeoDto(String codigo, String nombre) {
        this.codigo = codigo;
        this.nombre = nombre;
    }

}
