package com.uptc.idiomas.certigest.repo;

import static org.junit.jupiter.api.Assertions.*;

import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.entity.Person;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Date;
import java.util.List;

@DataJpaTest
public class GroupPersonRepoTest {

    @Autowired
    GroupPersonRepo groupPersonRepo;

    @Autowired
    TestEntityManager entityManager;

    private GroupInst group;
    private Person person;
    private GroupPerson groupPerson;

    @BeforeEach
    void setUp() {
        group = new GroupInst();
        // No asignar group_id
        entityManager.persist(group);
    
        person = new Person();
        // No asignar personId
        entityManager.persist(person);
    
        groupPerson = new GroupPerson();
        GroupPersonId id = new GroupPersonId(person.getPersonId(), group.getGroup_id());
        groupPerson.setId(id);
        groupPerson.setGroup_id(group);
        groupPerson.setPerson_id(person);
        groupPerson.setStart_date(new Date(System.currentTimeMillis() - 100000));
        groupPerson.setEnd_date(new Date(System.currentTimeMillis() + 100000));
        entityManager.persist(groupPerson);
    
        entityManager.flush();
    }


    @Test
    void testFindGroupsByStudentId() {
        List<GroupInst> groups = groupPersonRepo.findGroupsByStudentId(person.getPersonId());
        assertFalse(groups.isEmpty(), "Should find groups for student");
        assertEquals(group.getGroup_id(), groups.get(0).getGroup_id());
    }

    @Test
    void testFindActiveGroupInstsByDate() {
        List<GroupInst> groups = groupPersonRepo.findActiveGroupInstsByDate(new Date());
        assertFalse(groups.isEmpty(), "Should find active groups");
        assertEquals(group.getGroup_id(), groups.get(0).getGroup_id());
    }

    @Test
    void testFindPersonsByGroupIdAndActiveDate() {
        List<Person> persons = groupPersonRepo.findPersonsByGroupIdAndActiveDate(group.getGroup_id(), new Date());
        assertFalse(persons.isEmpty(), "Should find persons in active group");
        assertEquals(person.getPersonId(), persons.get(0).getPersonId());
    }

    @Test
    void testDeleteByGroupId() {
        groupPersonRepo.deleteByGroupId(group.getGroup_id());
        entityManager.flush();

        List<GroupPerson> all = groupPersonRepo.findAll();
        assertTrue(all.isEmpty(), "All group-person links should be deleted for group");
    }

    @Test
    void testDeleteByPersonId() {
        groupPersonRepo.deleteByPersonId(person.getPersonId());
        entityManager.flush();

        List<GroupPerson> all = groupPersonRepo.findAll();
        assertTrue(all.isEmpty(), "All group-person links should be deleted for person");
    }

    @Test
    void testExistsByPerson_id_PersonId() {
        boolean exists = groupPersonRepo.existsByPerson_id_PersonId(person.getPersonId());
        assertTrue(exists, "GroupPerson should exist for this person");
    }

    @Test
    void testExistsByPerson_id_PersonId_NotExists() {
        boolean exists = groupPersonRepo.existsByPerson_id_PersonId(9999);
        assertFalse(exists, "No GroupPerson should exist for unknown person");
    }
}
