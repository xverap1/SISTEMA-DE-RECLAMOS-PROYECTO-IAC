package gob.imss.gestor_productos.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String correoRemitente;

    public void enviarCorreoHtml(String para, String asunto, String cuerpoHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(correoRemitente);

            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // El 'true' activa el soporte para HTML

            mailSender.send(message);
            System.out.println("📧 Correo enviado con éxito a: " + para);
        } catch (Exception e) {
            System.err.println("❌ Error al enviar correo: " + e.getMessage());
        }
    }
}