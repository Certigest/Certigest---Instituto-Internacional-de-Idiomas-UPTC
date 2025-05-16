package com.uptc.idiomas.certigest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uptc.idiomas.certigest.dto.LocationDTO;
import com.uptc.idiomas.certigest.service.LocationService;

/**
 * Controlador REST para la gestión de ubicaciones en la plataforma.
 * Proporciona un endpoint para obtener ubicaciones por ID de padre.
 */
@RestController
@RequestMapping("/api/locations")

public class LocationController {

    @Autowired
    private LocationService locationService;

    /**
     * Obtiene una lista de ubicaciones filtradas por ID de padre.
     *
     * @param parentId ID del padre para filtrar las ubicaciones.
     * @return ResponseEntity con la lista de ubicaciones y el código de estado HTTP
     *         200 (OK).
     */
    @GetMapping
    public ResponseEntity<List<LocationDTO>> getLocations(@RequestParam(required = false) Integer parentId) {
        return ResponseEntity.ok(locationService.getLocationsByParentId(parentId));
    }
}
