package com.uptc.idiomas.certigest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.service.CourseService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Controlador REST para la gestión de cursos en la plataforma.
 * Proporciona endpoints para crear, obtener, actualizar y eliminar cursos.
 */
@RestController
@RequestMapping("/course")
public class CourseController {

    @Autowired
    private CourseService courseService;

    /**
     * Crea un nuevo curso.
     *
     * @param courseDTO Objeto que contiene los datos del curso a crear.
     * @return ResponseEntity con el curso creado y el código de estado HTTP 201
     *         (CREATED).
     */
    @PostMapping("/createCourse")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        CourseDTO created = courseService.create(courseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Obtiene un curso por su ID.
     *
     * @param id ID del curso a obtener.
     * @return ResponseEntity con el curso encontrado y el código de estado HTTP 200
     *         (OK) o 404 (NOT FOUND) si no se encuentra el curso.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Integer id) {
        CourseDTO course = courseService.findById(id);
        return course != null ? ResponseEntity.ok(course) : ResponseEntity.notFound().build();
    }

    /**
     * Obtiene todos los cursos.
     *
     * @return ResponseEntity con la lista de cursos y el código de estado HTTP 200
     *         (OK).
     */
    @GetMapping("/all")
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.findAll());
    }

    /**
     * Actualiza un curso existente.
     *
     * @param courseDTO Objeto que contiene los datos del curso a actualizar.
     * @return ResponseEntity con el curso actualizado y el código de estado HTTP
     *         200 (OK).
     */
    @PutMapping("/update")
    public ResponseEntity<CourseDTO> updateCourse(@RequestBody CourseDTO courseDTO) {
        CourseDTO updated = courseService.update(courseDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Elimina un curso por su ID.
     *
     * @param id ID del curso a eliminar.
     * @return ResponseEntity con el código de estado HTTP 204 (NO CONTENT).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Integer id) {
        courseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}