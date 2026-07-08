package gob.imss.gestor_productos.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.security.core.userdetails.UserDetails; // 🌟 Importación clave
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class JwtUtils {

    private final String SECRET_KEY = "FirmaSuperSecretaBancariaQueNadieDebeSaber";
    private final String GENERATOR_USER = "GestorProductosBackend";

    /**
     * CAMBIO AQUÍ: Ahora recibe un UserDetails (que es tu objeto Usuario).
     * Esto te permite invocarlo desde el AuthService pasándole el usuario completo,
     * pero internamente solo extraemos su username. ¡Ganamos en ambos mundos!
     */
    public String generateToken(UserDetails userDetails) {
        return JWT.create()
                .withIssuer(GENERATOR_USER)
                .withSubject(userDetails.getUsername()) // 🌟 Extraemos el string de forma segura
                // 💡 OPCIONAL: Si el día de mañana quieres que el área o el rol viajen en el token,
                // solo tendrías que agregar una línea como esta:
                // .withClaim("rol", userDetails.getAuthorities().toString())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 7200000)) // 2 horas
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    /**
     * Valida si el token es auténtico y pertenece al usuario que lo está usando.
     * Spring Security agradece mucho esta validación doble.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            JWT.require(Algorithm.HMAC256(SECRET_KEY))
                    .withIssuer(GENERATOR_USER)
                    .build()
                    .verify(token);

            // Adicionalmente verificamos que el usuario del token coincida con el que hace la petición
            String usernameDelToken = extractUsername(token);
            return (usernameDelToken.equals(userDetails.getUsername()));
        } catch (JWTVerificationException exception) {
            return false;
        }
    }

    /**
     * Extrae el nombre de usuario (Subject) que viene dentro del token.
     */
    public String extractUsername(String token) {
        return JWT.decode(token).getSubject();
    }
}