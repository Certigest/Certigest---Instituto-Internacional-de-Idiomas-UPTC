package com.uptc.idiomas.certigest.service;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.Course.CourseType;
import com.uptc.idiomas.certigest.mapper.CourseMapper;
import com.uptc.idiomas.certigest.repo.CourseRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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
        // Arrange
        CourseDTO dto = new CourseDTO();
        dto.setCourse_name("Francés Básico");
        dto.setCourse_type("DEFAULT");
        dto.setCourse_description("Curso para principiantes");
        dto.setLanguage("Francés");
        dto.setCreation_date(new Date());

        Course courseMock = CourseMapper.INSTANCE.mapCourseDTOToCourse(dto);
        courseMock.setId_course(1);

        when(courseRepo.save(any(Course.class))).thenReturn(courseMock);

        // Act
        CourseDTO result = courseService.addCourseInDb(dto);

        // Assert
        assertNotNull(result);
        assertEquals("Francés Básico", result.getCourse_name());
        assertEquals(CourseType.DEFAULT, result.getCourse_type());
        assertEquals("Francés", result.getLanguage());
    }
}
