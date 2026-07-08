package gob.imss.gestor_productos.repository;

import gob.imss.gestor_productos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario en MariaDB a partir de su username (correo o clave).
     * Spring Data JPA generará el SQL automáticamente tras bambalinas:
     * "SELECT * FROM usuarios WHERE username = ?"
     */
    Optional<Usuario> findByUsername(String username);
    boolean existsByCorreo(String correo);
}