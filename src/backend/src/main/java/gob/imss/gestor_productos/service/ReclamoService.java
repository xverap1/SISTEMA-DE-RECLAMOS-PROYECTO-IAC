package gob.imss.gestor_productos.service;

import gob.imss.gestor_productos.model.Reclamo;
import gob.imss.gestor_productos.model.Usuario;
import gob.imss.gestor_productos.model.dto.ResolucionReclamoDto;
import gob.imss.gestor_productos.repository.ReclamoRepository;
import gob.imss.gestor_productos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReclamoService {

    @Autowired
    private ReclamoRepository reclamoRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Reclamo guardarReclamo(Reclamo reclamo, String usuarioActivo) {
        // Guardamos el ticket en MariaDB
        reclamo.setUsuarioCreo(usuarioActivo);
        Reclamo guardado = reclamoRepository.save(reclamo);

        // Generamos el registro de auditoría institucional
        String detalles = String.format("Se aperturó un nuevo ticket de reclamo. Prioridad: %s. Estado inicial: %s",
                guardado.getPrioridad(), guardado.getEstadoTicket());

        /*if ("ALTA".equals(guardado.getPrioridad().toString())) {
            detalles += " 🚨 REQUERIMIENTO URGENTE.";
        }*/

        auditoriaService.registrarMovimientoReclamo(guardado, usuarioActivo, "RECLAMO_ALTA", detalles);

        Usuario usuario = usuarioRepository.findByUsername(guardado.getUsuarioCreo()).orElse(null);
        if (usuario != null) {
            String cuerpo = "<h3>Hola, " + usuario.getNombre() + "</h3>" +
                    "<p>Hemos recibido tu reclamo con éxito bajo el folio <code>" + guardado.getFolioReferencia() + "</code>.</p>" +
                    "<p><strong>Asunto:</strong> " + guardado.getAsunto() + "</p>" +
                    "<p>Nuestro equipo de soporte técnico lo revisará a la brevedad. El ID de tu ticket es #" + guardado.getId() + ".</p>";

            emailService.enviarCorreoHtml(usuario.getCorreo(), "Confirmación de Reclamo #" + guardado.getId(), cuerpo);
        }

        return guardado;
    }

    // 🌟 Añade este método en ReclamoService.java
    @Transactional
    public Reclamo resolverReclamo(Long reclamoId, ResolucionReclamoDto dto, String usuarioAdmin) {
        // 1. Validar que el reclamo exista
        Reclamo reclamo = reclamoRepository.findById(reclamoId)
                .orElseThrow(() -> new IllegalArgumentException("El número de reclamo no existe."));

        // 2. Validar que no esté resuelto ya
        if ("RESUELTO".equals(reclamo.getEstadoTicket())) {
            throw new IllegalStateException("Este reclamo ya ha sido resuelto previamente.");
        }

        // 3. Actualizar la información del ticket
        reclamo.setRespuestaSoporte(dto.getRespuestaSoporte());
        reclamo.setUsuarioResolvio(usuarioAdmin);
        reclamo.setEstadoTicket("RESUELTO");
        reclamo.setFechaResolucion(LocalDateTime.now());

        Reclamo actualizado = reclamoRepository.save(reclamo);

        // 4. 🚨 AUDITORÍA INSTITUCIONAL: Registramos la solución
        String detallesLog = String.format("El administrador resolvió el ticket. Folio afectado: %s.", actualizado.getFolioReferencia());
        auditoriaService.registrarMovimientoReclamo(actualizado, usuarioAdmin, "RECLAMO_RESUELTO", detallesLog);

        Usuario usuario = usuarioRepository.findByUsername(actualizado.getUsuarioCreo()).orElse(null);

        if (usuario != null) {
            String cuerpo = "<h3>¡Tu reclamo #" + actualizado.getId() + " ha sido resuelto!</h3>" +
                    "<p><strong>Resolución de soporte:</strong></p>" +
                    "<blockquote style='background: #f4f4f4; padding: 10px; border-left: 5px solid #28a745;'>" + actualizado.getRespuestaSoporte() + "</blockquote>" +
                    "<p>Agradecemos tu paciencia.</p>";

            emailService.enviarCorreoHtml(usuario.getCorreo(), "Resolución de Ticket #" + actualizado.getId(), cuerpo);
        }

        return actualizado;
    }

    // 🌟 Añade esto dentro de tu ReclamoService.java
    @Transactional(readOnly = true)
    public List<Reclamo> obtenerTodosLosReclamos() {
        // Los ordenamos de forma descendente por ID para que los nuevos aparezcan arriba
        return reclamoRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
    }

    public Reclamo obtenerReclamoPorId(Long reclamoId) {
        Reclamo reclamo = reclamoRepository.findById(reclamoId)
                .orElseThrow(() -> new IllegalArgumentException("El número de reclamo no existe."));
        return reclamo;
    }
}