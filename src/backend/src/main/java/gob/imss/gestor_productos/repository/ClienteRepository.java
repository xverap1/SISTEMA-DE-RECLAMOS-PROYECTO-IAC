package gob.imss.gestor_productos.repository;

import gob.imss.gestor_productos.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Regla de validación: Verifica si un correo ya está en uso
    boolean existsByCorreoElectronico(String correoElectronico);
    boolean existsByUsername(String username);
}