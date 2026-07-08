package gob.imss.gestor_productos.config;

import gob.imss.gestor_productos.model.Usuario;
import gob.imss.gestor_productos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.findByUsername("crystian.dev").isEmpty()) {

            Usuario admin = new Usuario();
            admin.setUsername("crystian.dev");

            String passwordSeguro = passwordEncoder.encode("Imss2026!");
            admin.setPassword(passwordSeguro);

            admin.setNombreCompleto("Crystian Peralta");
            admin.setArea("Desarrollo de Sistemas");
            admin.setRol("ROLE_ADMIN");
            admin.setNombreSupervisor("Ing. Mario");
            // admin.setPuesto("Auditor");

            usuarioRepository.save(admin);
            System.out.println("¡Usuario inicial de prueba 'crystian.dev' creado con éxito y contraseña encriptada!");
        }
    }
}