package gob.imss.gestor_productos.security;

import gob.imss.gestor_productos.model.Usuario;
import gob.imss.gestor_productos.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Extraer la cabecera llamada 'Authorization'
        String authorizationHeader = request.getHeader("Authorization");

        // 2. Validar que la cabecera exista y empiece con el estándar 'Bearer '
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7); // Cortamos la palabra "Bearer " para quedarnos solo con el JWT

            String username = jwtUtils.extractUsername(token);

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 3. Validar el token criptográficamente
            if (jwtUtils.validateToken(token, userDetails)) {

                Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();

                // 4. Si es válido, lo registramos en el contexto de seguridad de Spring
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

                //authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 5. Continuar con el flujo normal de la petición (ir al Controller)
        filterChain.doFilter(request, response);
    }
}