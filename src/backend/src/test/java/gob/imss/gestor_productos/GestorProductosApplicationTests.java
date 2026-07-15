package gob.imss.gestor_productos;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles; // <-- Importar esto

@SpringBootTest
@ActiveProfiles("test") // <-- Agregar esto
class GestorProductosApplicationTests {

    @Test
    void contextLoads() {
    }

}