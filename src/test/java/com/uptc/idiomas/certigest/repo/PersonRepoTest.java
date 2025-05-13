package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class PersonRepoTest {

    @Autowired
    PersonRepo personRepo;

    @Autowired
    TestEntityManager entityManager;

    private Person person;

    @BeforeEach
    public void setUp() {
        // Crear y persistir la entidad Location
        Location location = new Location();
        location.setLocationName("Test Location");
        entityManager.persist(location);
    
        // Crear y persistir la entidad Person
        person = new Person();
        person.setFirstName("John");
        person.setLastName("Doe");
        person.setDocumentType(Person.DocumentType.CC);
        person.setDocument("123456789");
        person.setEmail("johndoe@test.com");
        person.setPhone("123456789");
        person.setStatus(true);
        person.setBirthDate(new Date());
        person.setLocation(location);
        entityManager.persist(person);
    
    }


    @Test
    void testExistsByDocument() {
        boolean exists = personRepo.existsByDocument("123456789");
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByEmail() {
        boolean exists = personRepo.existsByEmail("johndoe@test.com");
        assertThat(exists).isTrue();
    }

    @Test
    void testFindByDocument() {
        Optional<Person> foundPerson = personRepo.findByDocument("123456789");
        assertThat(foundPerson).isPresent();
        assertThat(foundPerson.get().getEmail()).isEqualTo("johndoe@test.com");
    }

    @Test
    void testFindByEmail() {
        Optional<Person> foundPerson = personRepo.findByEmail("johndoe@test.com");
        assertThat(foundPerson).isPresent();
        assertThat(foundPerson.get().getDocument()).isEqualTo("123456789");
    }

}
