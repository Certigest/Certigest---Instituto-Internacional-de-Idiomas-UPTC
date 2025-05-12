package com.uptc.idiomas.certigest.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.Level;

@DataJpaTest
public class LevelRepoTest {

    @Autowired
    LevelRepo levelRepo;
    @Autowired
    TestEntityManager entityManager;

    @BeforeEach
    void setUp() {
        Course course = new Course();
        course.setCourse_name("Sample Course");
        entityManager.persist(course);

        Level level = new Level();
        level.setLevel_name("Test Level");
        level.setLevel_description("Test Description");
        level.setId_course(course);
        entityManager.persist(level);
    }

    @Test
    void testFindByLevelId() {
        Optional<Level> level = levelRepo.findById(1);
        assertEquals(level.get().getLevel_id(), 1);
        assertEquals(level.get().getLevel_name(), "Test Level");
        assertEquals(level.get().getLevel_description(), "Test Description");
    }

    @Test
    void testNotFoundByLevelId() {
        Optional<Level> level = levelRepo.findById(2);
        assertEquals(level, Optional.empty());
    }

    @Test
    void testFindByCourseId() {
        Course course = entityManager.find(Course.class, 1);
        List<Level> levels = levelRepo.findByCourseId(course.getId_course());
        Level level = levels.get(0);
        assertEquals(level.getLevel_id(), 1);
        assertEquals(level.getLevel_name(), "Test Level");
    }
}
