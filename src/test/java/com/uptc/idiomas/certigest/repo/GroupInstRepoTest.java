package com.uptc.idiomas.certigest.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.entity.Person;

@DataJpaTest
public class GroupInstRepoTest {

    @Autowired
    GroupInstRepo groupInstRepo;
    @Autowired
    TestEntityManager entityManager;

    @BeforeEach
    void setUp() {
        Course course = new Course();
        course.setCourse_name("Test Course");
        entityManager.persist(course);

        Level level = new Level();
        level.setLevel_name("Test Level");
        level.setId_course(course);
        entityManager.persist(level);

        Person person = new Person();
        person.setFirstName("Test Person");
        entityManager.persist(person);

        GroupInst groupInst = new GroupInst();
        groupInst.setGroup_name("Test Active Group");
        groupInst.setLevel_id(level);
        groupInst.setGroup_teacher(person);
        groupInst.setState(true);
        entityManager.persist(groupInst);

        GroupInst groupInstInactive = new GroupInst();
        groupInstInactive.setGroup_name("Test Active Group");
        groupInstInactive.setState(false);
        entityManager.persist(groupInstInactive);

        entityManager.flush();
    }

    @Test
    void testFindAllActiveGroups() {
        List<GroupInst> activeGroups = groupInstRepo.findAllActiveGroups();
        assertEquals(1, activeGroups.size());
        assertEquals("Test Active Group", activeGroups.get(0).getGroup_name());
        assertEquals("Test Course", activeGroups.get(0).getLevel_id().getId_course().getCourse_name());
        assertEquals("Test Level", activeGroups.get(0).getLevel_id().getLevel_name());
        assertEquals("Test Person", activeGroups.get(0).getGroup_teacher().getFirstName());
    }

    @Test
    void testFindByLevelId() {
        List<GroupInst> groups = groupInstRepo.findByLevelId(1);
        assertEquals(1, groups.size());
        assertEquals("Test Active Group", groups.get(0).getGroup_name());
        assertEquals("Test Level", groups.get(0).getLevel_id().getLevel_name());
        assertEquals("Test Course", groups.get(0).getLevel_id().getId_course().getCourse_name());
        assertEquals("Test Person", groups.get(0).getGroup_teacher().getFirstName());
    }
}
