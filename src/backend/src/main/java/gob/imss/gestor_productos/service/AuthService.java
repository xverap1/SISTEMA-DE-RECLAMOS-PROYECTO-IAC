package gob.imss.gestor_productos.service;


import gob.imss.gestor_productos.model.dto.LoginRequest;
import gob.imss.gestor_productos.repository.UsuarioRepository;
import gob.imss.gestor_productos.security.JwtUtils;
import gob.imss.gestor_productos.model.dto.LoginResponse;
import gob.imss.gestor_productos.model.Usuario;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtils jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;


    /**
     * Procesa el inicio de sesión y construye el perfil completo del usuario
     */
    public LoginResponse login(LoginRequest request) {
        // 1. Spring Security valida que las credenciales sean correctas en MariaDB
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.usuario(),
                        request.contrasena()
                )
        );

        // 2. Si la contraseña es correcta, buscamos el objeto Usuario entero en la BD
        Usuario usuario = usuarioRepository.findByUsername(request.usuario())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con el identificador: " + request.usuario()));

        // 3. Generamos el token JWT tradicional pasándole los datos del usuario
        String jwtToken = jwtService.generateToken(usuario);

        // 4. 🌟 CONSTRUIMOS LA RESPUESTA CON EL PERFIL COMPLETO DESDE LA BASE DE DATOS
        // Si usaste la clase tradicional con constructor, se vería así:

        return new LoginResponse(
                jwtToken,
                usuario.getUsername(),
                usuario.getNombreCompleto(),
                usuario.getArea(),
                usuario.getRol(),
                usuario.getNombreSupervisor()
        );

        /* 💡 NOTA: Si en el paso anterior usaste un 'record' de Java para tu LoginResponse,
           en lugar de usar los 'setters' de arriba, retornarías de golpe en una sola línea así:

        return new LoginResponse(
            jwtToken,
            usuario.getUsername(),
            usuario.getNombreCompleto(),
            usuario.getArea(),
            usuario.getRol(),
            usuario.getNombreSupervisor()
        );
        */
    }
}