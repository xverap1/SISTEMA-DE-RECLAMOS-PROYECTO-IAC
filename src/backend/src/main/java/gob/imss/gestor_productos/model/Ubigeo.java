package gob.imss.gestor_productos.model;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cat_ubigeos", indexes = {
        @Index(name = "idx_ubigeo_code", columnList = "codigo_ubigeo")
})
@Data
public class Ubigeo {

    @Id
    @Column(name = "codigo_ubigeo", length = 6) // Ej: "010101"
    private String codigoUbigeo;

    @Column(nullable = false, length = 100)
    private String departamento;

    @Column(nullable = false, length = 100)
    private String provincia;

    @Column(nullable = false, length = 100)
    private String distrito;
}