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

    private Course course;

    @BeforeEach
    void setUp() {
        course = new Course();
        course.setCourse_name("Test Course");
        course.setCourse_description("Test Description");
        entityManager.persist(course);
    }

    @Test
    void testFindByCourseId() {
        Course course2 = courseRepo.findById(course.getId_course()).orElse(null);
        assertEquals(course2.getId_course(), 1);
        assertEquals(course2.getCourse_name(), "Test Course");
        assertEquals(course2.getCourse_description(), "Test Description");
    }
}
