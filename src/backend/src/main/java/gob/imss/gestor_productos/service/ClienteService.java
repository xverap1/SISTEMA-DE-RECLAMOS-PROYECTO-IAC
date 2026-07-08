package gob.imss.gestor_productos.service;

import gob.imss.gestor_productos.model.Cliente;
import gob.imss.gestor_productos.model.Usuario;
import gob.imss.gestor_productos.model.dto.ClienteRegistroDto;
import gob.imss.gestor_productos.repository.ClienteRepository;
import gob.imss.gestor_productos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final AuditoriaService auditoriaService;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository, AuditoriaService auditoriaService, PasswordEncoder passwordEncoder, UsuarioRepository usuarioRepository, EmailService emailService) {
        this.clienteRepository = clienteRepository;
        this.auditoriaService = auditoriaService;
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    /**
     * Registra un nuevo cliente y dispara el log de auditoría
     */
    @Transactional
    public Usuario registrarNuevoCliente(ClienteRegistroDto dto) {
        // 1. Validar que el username no esté ocupado
        if (clienteRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya se encuentra registrado.");
        }

        if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("El nombre de usuario ya se encuentra registrado.");
        }

        // 2. Validar si el correo ya está registrado
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new IllegalArgumentException("El correo electrónico ya está en uso.");
        }

        // 2. Crear y mapear la entidad
        Usuario nuevoCliente = new Usuario();
        nuevoCliente.setUsername(dto.getUsername());
        //nuevoCliente.setNombreCompleto(dto.getNombreCompleto());
        nuevoCliente.setCorreo(dto.getCorreo());
        nuevoCliente.setNombre(dto.getNombre());
        nuevoCliente.setApellidoPaterno(dto.getApellidoPaterno());
        nuevoCliente.setApellidoMaterno(dto.getApellidoMaterno());
        nuevoCliente.setDireccion(dto.getDireccion());
        nuevoCliente.setCelular(dto.getCelular());
        nuevoCliente.setDni(dto.getDni());

        nuevoCliente.setNombreCompleto(dto.getNombre()+" "+dto.getApellidoPaterno());

        // Encriptamos la clave antes de guardarla en MariaDB 🔐
        nuevoCliente.setPassword(passwordEncoder.encode(dto.getPassword()));

        // Asignamos el rol por defecto para los clientes que levantan quejas
        //nuevoCliente.set
        //nuevoCliente.setRol("ROLE_USER");
        nuevoCliente.setRol("ROLE_USER");

        Usuario usuarioGuardado = usuarioRepository.save(nuevoCliente);

        String cuerpo = "<h2>¡Bienvenido " + usuarioGuardado.getNombre() + "!</h2>" +
                "<p>Tu cuenta ha sido creada con éxito. Tu nombre de usuario es: <strong>" + usuarioGuardado.getUsername() + "</strong></p>" +
                "<p>Ya puedes ingresar a la plataforma a gestionar tus productos y reclamos.</p>";

        emailService.enviarCorreoHtml(usuarioGuardado.getCorreo(), "¡Bienvenido a Gestor Productos!", cuerpo);

        return usuarioGuardado;
    }
}