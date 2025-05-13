// Ubicación sugerida: com.uptc.idiomas.certigest.service

package com.uptc.idiomas.certigest.service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Servicio para el envío de correos electrónicos relacionados con credenciales de acceso.
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Envía un correo electrónico al usuario con su nombre de usuario y contraseña.
     * 
     * @param email    la dirección de correo electrónico del destinatario.
     * @param username el nombre de usuario asignado.
     * @param password la contraseña generada.
     * @throws RuntimeException si ocurre un error durante el envío del correo.
     */
    public void sendCredentialsEmail(String email, String username, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom(new InternetAddress("certigestuptc@gmail.com"));
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
            throw new RuntimeException("Error al enviar correo a: " + email, e);
        }
    }
}
