package gob.imss.gestor_productos.repository;

import gob.imss.gestor_productos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Buscar un producto por su identificador de negocio (Folio único)
    Optional<Producto> findByFolioNegocio(String folioNegocio);

    // Buscar un producto por su clave alfanumérica
    Optional<Producto> findByClaveProducto(String claveProducto);

    // Verificar si ya existe un producto con esa clave
    boolean existsByClaveProducto(String claveProducto);
}