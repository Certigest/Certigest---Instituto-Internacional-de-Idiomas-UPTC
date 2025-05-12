package com.uptc.idiomas.certigest.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.repo.CourseRepo;
import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.entity.Course;
import jakarta.persistence.EntityNotFoundException;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Arrays;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {

    @InjectMocks
    private CourseService courseService;

    @Mock
    private CourseRepo courseRepo;

    @Mock
    private LevelService levelService;

    private Course course;
    private CourseDTO courseDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        course = new Course();
        course.setId_course(1);
        course.setCourse_name("Test Course");
        course.setState(true);

        courseDTO = new CourseDTO();
        courseDTO.setId_course(1);
        courseDTO.setCourse_name("Test Course");
        courseDTO.setState(true);
    }

    @Test
    void testToEntity() {
        Course result = courseService.toEntity(courseDTO);
        assertNotNull(result);
        assertEquals(courseDTO.getId_course(), result.getId_course());
        assertEquals(courseDTO.getCourse_name(), result.getCourse_name());
    }

    @Test
    void testToDTO() {
        CourseDTO result = courseService.toDTO(course);
        assertNotNull(result);
        assertEquals(course.getId_course(), result.getId_course());
        assertEquals(course.getCourse_name(), result.getCourse_name());
    }

    @Test
    void testGetRepo() {
        assertEquals(courseRepo, courseService.getRepo());
    }

    @Test
    void testDeleteById() {
        when(courseRepo.findById(1)).thenReturn(Optional.of(course));

        LevelDTO level1 = new LevelDTO();
        level1.setLevel_id(100);

        LevelDTO level2 = new LevelDTO();
        level2.setLevel_id(200);

        List<LevelDTO> levels = Arrays.asList(level1, level2);
        when(levelService.findByCourseId(1)).thenReturn(levels);

        courseService.deleteById(1);

        verify(levelService, times(1)).deleteById(100);
        verify(levelService, times(1)).deleteById(200);
        assertFalse(course.getState());
        verify(courseRepo, times(1)).save(course);
    }

    @Test
    void testDeleteById_NotFound() {
        when(courseRepo.findById(999)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            courseService.deleteById(999);
        });

        verify(courseRepo, never()).save(any());
        verify(levelService, never()).deleteById(anyInt());
    }
}
