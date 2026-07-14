package gob.imss.gestor_productos.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. HABILITAMOS CORS y desactivamos CSRF porque usamos tokens JWT
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll() // Login público
                        .requestMatchers("/api/v1/clientes/**").permitAll() // Login público
                        .requestMatchers("/actuator/health", "/actuator/prometheus", "/actuator/info").permitAll() // Scrape de Prometheus (ver monitoring/prometheus/prometheus.yml)
                        .anyRequest().authenticated()                  // Catálogo protegido
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // Aquí debes tener la inyección de tu JwtAuthenticationFilter antes del de Spring...
        http.addFilterBefore(jwtAuthFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 2. CREAMOS EL CONFIGURADOR DE CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Autorizamos explícitamente a tu servidor de Angular
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));

        // Autorizamos los métodos HTTP que utilizará tu CRUD
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Autorizamos las cabeceras necesarias (incluyendo Authorization para el JWT)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));

        // Permitimos el envío de credenciales o cookies si fuera necesario
        configuration.setAllowCredentials(true);

        // Registramos esta configuración para todos los endpoints de la API
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}