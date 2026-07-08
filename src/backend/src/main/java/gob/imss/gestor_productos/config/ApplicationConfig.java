package gob.imss.gestor_productos.config;

import gob.imss.gestor_productos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

    @Autowired
    private UsuarioRepository usuarioRepository; // <- Tu nuevo repositorio

    /**
     * Este es el Bean que inyectas en el JwtAuthenticationFilter
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado en MariaDB: " + username));
    }

    /**
     * 1. Definimos el codificador de contraseñas.
     * BCrypt es el estándar de seguridad para encriptar los passwords en la BD.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 2. El AuthenticationProvider une al UserDetailsService (que busca en la BD)
     * con el PasswordEncoder (que sabe desencriptar y comparar las contraseñas).
     */
    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        //authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * 3. 🌟 LA PIEZA QUE FALTA: El AuthenticationManager definitivo.
     * Lo extraemos directamente de la configuración nativa de Spring.
     * Esto solucionará de inmediato el error de compilación en tu AuthService.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}