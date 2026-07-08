package gob.imss.gestor_productos.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;


@Entity
@Table(name = "usuarios")
@Getter
@Setter


public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // El correo o clave con la que inicia sesión

    @Column(nullable = false)
    private String password;

    private String nombreCompleto;
    private String area;
    private String puesto;
    private String antiguedad; // Ej: "2 años y 4 meses" o una fecha de ingreso
    private String rol;        // Ej: "ROLE_ADMIN", "ROLE_CAPTURISTA"
    private String nombreSupervisor;

    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;

    private String celular;
    private String dni;
    private String direccion;
    private String correo;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of(new SimpleGrantedAuthority(this.rol));
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

	@Override
	public @Nullable String getPassword() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return null;
	}

    // ... tus constructores, getters y setters ...
}