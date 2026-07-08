package gob.imss.gestor_productos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reclamos")
@Data
@Getter
@Setter

public class Reclamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_reclamo", nullable = false, length = 50)
    private String tipoReclamo;

    @Column(name = "folio_referencia", nullable = false, length = 30)
    private String folioReferencia;

    @Column(nullable = false, length = 100)
    private String asunto;

    @Column(nullable = false, columnDefinition = "TEXT") // Permite textos largos de hasta 65,000 caracteres
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PrioridadReclamo prioridad;

    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "estado_ticket", nullable = false, length = 20)
    private String estadoTicket; // ABIERTO, EN_PROCESO, RESUELTO, CANCELADO

    // 🌟 Añade estos campos a tu clase Reclamo.java existente
    @Column(name = "ubigeo_incidente", nullable = false, length = 6)
    private String ubigeoIncidente; // Almacenará el código de 6 dígitos elegido

    @Column(name = "direccion_incidente", nullable = false, length = 255)
    private String direccionIncidente; // Detalle de la calle/sucursal del evento

    // 🌟 Añade esto dentro de tu clase Reclamo.java
    @Column(name = "respuesta_soporte", columnDefinition = "TEXT")
    private String respuestaSoporte;

    @Column(name = "usuario_resolvio", length = 50)
    private String usuarioResolvio;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(name = "usuario_creo", length = 50, nullable = false)
    private String usuarioCreo;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
        this.estadoTicket = "ABIERTO"; // Todo reclamo inicia abierto por defecto
    }
}

// Enumerado para tipar la urgencia
enum PrioridadReclamo {
    BAJA, MEDIA, ALTA

}