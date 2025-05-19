package com.uptc.idiomas.certigest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.service.LevelService;

/**
 * Controlador REST para la gestión de niveles en la plataforma.
 * Proporciona endpoints para crear, obtener, actualizar y eliminar niveles,
 * así como para obtener niveles por ID de curso.
 */
@RestController
@RequestMapping("/level")
public class LevelController {

    @Autowired
    private LevelService levelService;

    /**
     * Crea un nuevo nivel.
     *
     * @param levelDTO Objeto que contiene los datos del nivel a crear.
     * @return ResponseEntity con el nivel creado y el código de estado HTTP 201
     *         (CREATED).
     */
    @PostMapping("/createLevel")
    public ResponseEntity<LevelDTO> createLevel(@RequestBody LevelDTO levelDTO) {
        LevelDTO created = levelService.create(levelDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Obtiene un nivel por su ID.
     *
     * @param id ID del nivel a obtener.
     * @return ResponseEntity con el nivel encontrado y el código de estado HTTP 200
     *         (OK) o 404 (NOT FOUND) si no se encuentra el nivel.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LevelDTO> getLevelById(@PathVariable Integer id) {
        LevelDTO level = levelService.findById(id);
        return level != null ? ResponseEntity.ok(level) : ResponseEntity.notFound().build();
    }

    /**
     * Obtiene todos los niveles.
     *
     * @return ResponseEntity con la lista de niveles y el código de estado HTTP 200
     *         (OK).
     */
    @GetMapping("/all")
    public ResponseEntity<List<LevelDTO>> getAllLevels() {
        return ResponseEntity.ok(levelService.findAll());
    }

    /**
     * Actualiza un nivel existente.
     *
     * @param levelDTO Objeto que contiene los datos del nivel a actualizar.
     * @return ResponseEntity con el nivel actualizado y el código de estado HTTP
     *         200 (OK).
     */
    @PutMapping("/update")
    public ResponseEntity<LevelDTO> updateLevel(@RequestBody LevelDTO levelDTO) {
        LevelDTO updated = levelService.update(levelDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Elimina un nivel por su ID.
     *
     * @param id ID del nivel a eliminar.
     * @return ResponseEntity con el código de estado HTTP 204 (NO CONTENT).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Integer id) {
        levelService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtiene todos los niveles asociados a un curso específico.
     *
     * @param id_course ID del curso para el cual se desean obtener los niveles.
     * @return ResponseEntity con la lista de niveles asociados al curso y el código
     *         de estado HTTP 200 (OK).
     */
    @GetMapping("/by-course/{id_course}")
    public ResponseEntity<List<LevelDTO>> getLevelsByCourseId(@PathVariable Integer id_course) {
        List<LevelDTO> levels = levelService.findActiveByCourseId(id_course);
        return ResponseEntity.ok(levels);
    }
}
