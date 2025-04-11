package com.uptc.idiomas.certigest.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {

    @GetMapping("/public/hello")
    public String publicHello() {
        return "Hola";
    }
}
