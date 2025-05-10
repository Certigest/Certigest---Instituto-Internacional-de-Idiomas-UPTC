// Ubicación sugerida: com.uptc.idiomas.certigest.service

package com.uptc.idiomas.certigest.service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendCredentialsEmail(String email, String username, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom(new InternetAddress("no-reply@certigest.com"));  // Cambia según tu configuración
            message.setSubject("Tus credenciales de acceso");
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(email));

            String content = "Hola,\n\n" +
                    "Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:\n\n" +
                    "Nombre de usuario: " + username + "\n" +
                    "Contraseña: " + password + "\n\n" +
                    "Por favor cambia tu contraseña después de iniciar sesión.\n\n" +
                    "Saludos,\n" +
                    "Equipo CertiGest.";

            message.setText(content);
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al enviar correo a: " + email, e);
        }
    }
}
