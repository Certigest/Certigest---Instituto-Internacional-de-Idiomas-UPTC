package com.uptc.idiomas.certigest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración global de CORS para la aplicación.
 * Esta clase permite definir el origen permitido para las solicitudes entre dominios.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Origen permitido para solicitudes CORS, cargado desde las propiedades de la aplicación.
     */
    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    /**
     * Configura los mapeos de CORS para permitir solicitudes entre dominios desde el origen especificado.
     *
     * @param registry Objeto CorsRegistry que permite definir las reglas de CORS.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("*")
                .allowCredentials(true);
    }
}
