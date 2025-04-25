package com.uptc.idiomas.certigest.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.mapper.CourseMapper;
import com.uptc.idiomas.certigest.repo.CourseRepo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class CourseServiceTest {

    @Mock
    private CourseRepo courseRepo;

    @InjectMocks
    private CourseService courseService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAddCourseInDb() {
        CourseDTO dto = new CourseDTO();
        dto.setCourse_name("Curso de Java");
        dto.setCourse_description("Curso básico de Java");
        dto.setLanguage("Español");
        dto.setCourse_type(Course.CourseType.DEFAULT);

        // Convertimos el DTO a una entidad Course
        Course course = CourseMapper.INSTANCE.mapCourseDTOToCourse(dto);
        Course savedCourse = new Course();
        savedCourse.setId_course(1);
        savedCourse.setCourse_name("Curso de Python");
        savedCourse.setCourse_description("Curso básico de Python");
        savedCourse.setLanguage("Español");
        savedCourse.setCourse_type(Course.CourseType.DEFAULT);

        // Simulamos la respuesta del repo
        when(courseRepo.save(any(Course.class))).thenReturn(savedCourse);

        // Act: Llamamos al método del servicio
        CourseDTO result = courseService.addCourseInDb(dto);

        // Assert: Verificamos que la respuesta sea la esperada
        assertNotNull(result);
        assertEquals(1, result.getId_course());
        assertEquals("Curso de Java", result.getCourse_name());
        assertEquals("Español", result.getLanguage());
        assertEquals(Course.CourseType.DEFAULT, result.getCourse_type());
    }
}
