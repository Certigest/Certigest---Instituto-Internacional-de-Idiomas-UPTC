package com.uptc.idiomas.certigest.service;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.repo.CourseRepo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties") // Configuración específica para pruebas
public class CourseServiceIntegrationTest {

    @Autowired
    private CourseService courseService;

    @Autowired
    private CourseRepo courseRepo;

    @BeforeEach
    void setUp() {
        courseRepo.deleteAll(); // Limpiar la base antes de cada prueba
    }

    @Test
    void testAddCourseInDb_Integration() {
        // Arrange
        CourseDTO dto = new CourseDTO();
        dto.setCourse_name("Curso de Inglés");
        dto.setCourse_description("Curso intermedio de Inglés");
        dto.setLanguage("Inglés");
        dto.setCourse_type("DEFAULT");

        // Act: Guardamos el curso usando el servicio
        CourseDTO result = courseService.addCourseInDb(dto);

        // Assert: Verificamos que el curso fue guardado en la base de datos
        assertNotNull(result);
        assertTrue(courseRepo.findById(result.getId_course()).isPresent());
        assertEquals("Curso de Inglés", result.getCourse_name());
    }
}
