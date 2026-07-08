package gob.imss.gestor_productos.repository;


import gob.imss.gestor_productos.model.AuditoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditoriaProductoRepository extends JpaRepository<AuditoriaProducto, Long> {

    // Custom query para traer el historial ordenado del más nuevo al más antiguo
    List<AuditoriaProducto> findAllByOrderByFechaMovimientoDesc();
}