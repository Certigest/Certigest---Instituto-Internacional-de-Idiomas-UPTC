package com.uptc.idiomas.certigest.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para la gestión de endpoints públicos.
 * Proporciona un endpoint para verificar el estado del servidor.
 */
@RestController
public class Controller {

    /**
     * Endpoint público para verificar el estado del servidor.
     *
     * @return Mensaje de saludo.
     */
    @GetMapping("/public/hello")
    public String publicHello() {
        return "Hola";
    }
}
