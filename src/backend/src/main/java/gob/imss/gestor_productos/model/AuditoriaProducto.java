package gob.imss.gestor_productos.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_productos")
@Setter
@Getter


public class AuditoriaProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productoId;       // ID del producto afectado
    private String claveProducto;   // Clave (ej: LAP-M3-01) para tenerla a la mano
    private String nombreProducto;  // Nombre del producto
    private String usuarioAuditor;  // El usuario en sesión (ej: crystian.dev)
    private String accion;          // CREACIÓN, MODIFICACIÓN o DESACTIVACIÓN
    private String detalles;        // Texto libre (ej: "Se actualizó el precio de $20k a $25k")

    @JsonFormat(pattern = "dd/mm/yyyy HH:mm:ss")
    private LocalDateTime fechaMovimiento;

    // Constructores, Getters y Setters...
}