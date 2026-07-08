package gob.imss.gestor_productos.repository;

import gob.imss.gestor_productos.model.Reclamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReclamoRepository extends JpaRepository<Reclamo, Long> {
    // Busca reclamos activos por su estado
    List<Reclamo> findByEstadoTicket(String estadoTicket);

    @Query("SELECT r FROM Reclamo r ORDER BY r.id DESC")
    List<Reclamo> obtenerTodosLosReclamosOrdenados();
}