package com.uptc.idiomas.certigest.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.uptc.idiomas.certigest.entity.Course;

@DataJpaTest
public class CourseRepoTest {

    @Autowired
    CourseRepo courseRepo;
    @Autowired
    TestEntityManager entityManager;

    @BeforeEach
    void setUp() {
        Course course = new Course();
        course.setCourse_name("Test Course");
        course.setCourse_description("Test Description");
        entityManager.persist(course);
    }

    @Test
    void testFindByCourseId() {
        Course course = courseRepo.findById(1).orElse(null);
        assertEquals(course.getId_course(), 1);
        assertEquals(course.getCourse_name(), "Test Course");
        assertEquals(course.getCourse_description(), "Test Description");
    }
}
