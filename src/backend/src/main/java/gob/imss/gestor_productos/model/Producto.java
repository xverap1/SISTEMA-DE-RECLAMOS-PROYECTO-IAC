package gob.imss.gestor_productos.model;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PRODUCTOS")
public class Producto {

    // 1. Identificador Técnico (Control interno de BD)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRODUCTO")
    private Long id;

    // 2. Identificador de Negocio (Folio único autogenerado con prefijo, fecha y hora)
    // Nota: Al ser autogenerado por lógica, se calcula antes de insertar en la BD
    @Column(name = "FOLIO_NEGOCIO", nullable = false, unique = true, length = 50)
    private String folioNegocio;

    // 3. Clave del Producto (Máximo 10 caracteres)
    @Column(name = "CLAVE_PRODUCTO", nullable = false, length = 10)
    private String claveProducto;

    // 4. Nombre del Producto (Hasta 200 caracteres)
    @Column(name = "NOMBRE_PRODUCTO", nullable = false, length = 200)
    private String nombreProducto;

    // 5. Precio (Valor decimal con precisión de dos posiciones, ej: 999999.99)
    @Column(name = "PRECIO", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    // 6. Indicador de Vigencia (Activo/Inactivo)
    @Column(name = "IND_VIGENCIA", nullable = false)
    private Boolean activo;

    // 7. Fecha de Registro (Marca de tiempo exacta de creación)
    @Column(name = "FECHA_REGISTRO", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    // 8. Usuario Auditor (Responsable de la operación)
    @Column(name = "USUARIO_AUDITOR", nullable = false, length = 50)
    private String usuarioAuditor;

    /**
     * Evento de ciclo de vida de JPA (@PrePersist)
     * Ejecuta lógica automática justo antes de que el registro se guarde en la BD.
     */
    @PrePersist
    protected void onCreate() {
        // Asigna la fecha y hora exacta del sistema al momento de la creación
        this.fechaRegistro = LocalDateTime.now();

        // Define el estado inicial como activo por defecto
        if (this.activo == null) {
            this.activo = true;
        }

        // Genera el Identificador de Negocio dinámicamente
        // Ejemplo de salida: PROD-20260527-010523 (Prefijo-Fecha-Hora)
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
        this.folioNegocio = "PROD-" + this.fechaRegistro.format(formatter);
    }

    // =========================================================================
    // CONSTRUCTORES, GETTERS Y SETTERS
    // =========================================================================

    public Producto() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFolioNegocio() { return folioNegocio; }
    // No agregamos setter para folioNegocio para evitar que se modifique por error externo

    public String getClaveProducto() { return claveProducto; }
    public void setClaveProducto(String claveProducto) { this.claveProducto = claveProducto; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }

    public String getUsuarioAuditor() { return usuarioAuditor; }
    public void setUsuarioAuditor(String usuarioAuditor) { this.usuarioAuditor = usuarioAuditor; }
}