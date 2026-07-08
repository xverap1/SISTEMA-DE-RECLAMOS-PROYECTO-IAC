package gob.imss.gestor_productos.service;



import gob.imss.gestor_productos.model.AuditoriaProducto;
import gob.imss.gestor_productos.model.Cliente;
import gob.imss.gestor_productos.model.Producto;
import gob.imss.gestor_productos.model.Reclamo;
import gob.imss.gestor_productos.repository.AuditoriaProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditoriaService {

    @Autowired
    private AuditoriaProductoRepository auditoriaRepository;

    /**
     * Registra de forma genérica cualquier movimiento de un producto en la bitácora
     */
    @Transactional
    public void registrarMovimiento(Producto producto, String usuario, String accion, String detalles) {
        AuditoriaProducto log = new AuditoriaProducto();
        log.setProductoId(producto.getId());
        log.setClaveProducto(producto.getClaveProducto());
        log.setNombreProducto(producto.getNombreProducto());
        log.setUsuarioAuditor(usuario);
        log.setAccion(accion);
        log.setDetalles(detalles);
        log.setFechaMovimiento(LocalDateTime.now());

        auditoriaRepository.save(log);
    }

    /**
     * Recupera todo el historial para la línea de tiempo en Angular
     */
    public List<AuditoriaProducto> obtenerHistorialCompleto() {
        return auditoriaRepository.findAllByOrderByFechaMovimientoDesc();
    }

    @Transactional
    public void registrarMovimientoCliente(Cliente cliente, String usuario, String accion, String detalles) {
        AuditoriaProducto log = new AuditoriaProducto();
        log.setProductoId(cliente.getId()); // Reutilizamos el campo ID numérico de la bitácora
        log.setClaveProducto(cliente.getRfc() != null ? cliente.getRfc() : "SIN_RFC"); // Usamos el RFC como identificador de negocio
        log.setNombreProducto(cliente.getNombre() + " " + cliente.getPrimerApellido()); // Nombre completo del cliente
        log.setUsuarioAuditor(usuario);
        log.setAccion(accion);
        log.setDetalles(detalles);
        log.setFechaMovimiento(LocalDateTime.now());

        auditoriaRepository.save(log);
    }

    // 🌟 Agrega este método en AuditoriaService.java
    @Transactional
    public void registrarMovimientoReclamo(Reclamo reclamo, String usuario, String accion, String detalles) {
        AuditoriaProducto log = new AuditoriaProducto();
        log.setProductoId(reclamo.getId());
        log.setClaveProducto(reclamo.getFolioReferencia()); // Guardamos el folio de la factura afectada
        log.setNombreProducto("[" + reclamo.getTipoReclamo() + "] - " + reclamo.getAsunto());
        log.setUsuarioAuditor(usuario);
        log.setAccion(accion);
        log.setDetalles(detalles);
        log.setFechaMovimiento(LocalDateTime.now());

        auditoriaRepository.save(log);
    }

}