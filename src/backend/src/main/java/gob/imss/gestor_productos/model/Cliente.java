package gob.imss.gestor_productos.model;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
@Data // Genera getters, setters, toString y constructores automáticamente con Lombok
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta")
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "primer_apellido", nullable = false, length = 50)
    private String primerApellido;

    @Column(name = "segundo_apellido", length = 50)
    private String segundoApellido;

    @Column(name = "correo_electronico", nullable = false, unique = true)
    private String correoElectronico;

    @Column(nullable = false, length = 10)
    private String telefono;

    @Column(length = 13)
    private String rfc;

    @Column(nullable = false)
    private Boolean activo;

    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "usuario_auditor", nullable = false)
    private String usuarioAuditor;

    @Column(nullable = false, unique = true, length = 20)
    private String username;

    @Column(nullable = false, length = 60) // 60 caracteres es el tamaño estándar para el hash de BCrypt
    private String password;

    @Column(nullable = true)
    private String direccion;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
        this.activo = true;
    }
}