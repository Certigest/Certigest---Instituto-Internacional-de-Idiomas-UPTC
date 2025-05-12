package com.uptc.idiomas.certigest.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

    private Course course;
    private Level level;

    @BeforeEach
    void setUp() {
        course = new Course();
        course.setCourse_name("Sample Course");
        entityManager.persist(course);

        level = new Level();
        level.setLevel_name("Test Level");
        level.setLevel_description("Test Description");
        level.setId_course(course);
        entityManager.persist(level);

        entityManager.flush();
    }

    @Test
    void testFindByLevelId() {
        Optional<Level> level = levelRepo.findById(this.level.getLevel_id());
        assertTrue(level.isPresent(), "Level should be present");
        assertEquals(level.get().getLevel_id(), this.level.getLevel_id());
        assertEquals(level.get().getLevel_name(), "Test Level");
        assertEquals(level.get().getLevel_description(), "Test Description");
    }

    @Test
    void testNotFoundByLevelId() {
        Optional<Level> level = levelRepo.findById(999);
        assertFalse(level.isPresent(), "Level should not be present");
    }

    @Test
    void testFindByCourseId() {
        Course course = entityManager.find(Course.class, this.course.getId_course());

        List<Level> levels = levelRepo.findByCourseId(course.getId_course());
        assertFalse(levels.isEmpty(), "Levels should not be empty");
        Level level = levels.get(0);
        assertEquals(level.getLevel_id(), this.level.getLevel_id());
        assertEquals(level.getLevel_name(), "Test Level");
    }
}
