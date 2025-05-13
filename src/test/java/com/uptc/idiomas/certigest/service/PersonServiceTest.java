package com.uptc.idiomas.certigest.service;

import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.entity.Login;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.PersonMapper;
import com.uptc.idiomas.certigest.repo.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Collections;

@ExtendWith(MockitoExtension.class)
public class PersonServiceTest {

    @InjectMocks
    private PersonService personService;

    @Mock
    private PersonRepo personRepo;
    @Mock
    private PersonRoleRepo personRoleRepo;
    @Mock
    private LocationRepo locationRepo;
    @Mock
    private LoginRepo loginRepo;
    @Mock
    private KeycloakService keycloakService;
    @Mock
    private RoleRepo roleRepo;
    @Mock
    private GroupPersonRepo groupPersonRepo;
    @Mock
    private CertificateRepo certificateRepo;
    @Mock
    private CertificateLevelRepo certificateLevelRepo;
    @Mock
    private CertificateCodeRepo certificateCodeRepo;
    @Mock
    private EmailService emailService;

    private PersonDTO personDTO;
    private Person person;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        personDTO = new PersonDTO();
        personDTO.setFirstName("Carlos");
        personDTO.setLastName("Lopez");
        personDTO.setDocument("123456");
        personDTO.setEmail("carlos@test.com");
        personDTO.setRoles(Collections.emptyList());
        
        person = PersonMapper.INSTANCE.mapPersonDTOToPerson(personDTO);
        person.setPersonId(1);
    }

    @Test
    void testAddPersonInDb_shouldReturnSavedPerson() {
        // Arrange
        when(personRepo.save(any(Person.class))).thenReturn(person);
        when(loginRepo.existsByUserName(anyString())).thenReturn(false);

        // Act
        PersonDTO saved = personService.addPersonInDb(personDTO);

        // Assert
        assertNotNull(saved);
        assertEquals("Carlos", saved.getFirstName());
        verify(personRepo).save(any(Person.class));
        verify(loginRepo).save(any());
        verify(emailService).sendCredentialsEmail(personDTO.getEmail(), "carloslopez1", "123456");
    }

    @Test
    void testModifyAccountInfo_shouldUpdateData() {
        Login login = new Login();
        login.setUserName("user123");
        login.setPerson(person);

        lenient().when(loginRepo.findByUserName("user123")).thenReturn(Optional.ofNullable(null));
    }

    @Test
    void testDeletePersonById_shouldDeleteAllAssociatedEntities() {
        Person person = new Person();
        person.setPersonId(1);

        when(personRepo.findById(1)).thenReturn(Optional.of(person));
        when(loginRepo.findByPerson(person)).thenReturn(Optional.empty());

        personService.deletePersonById(1);

        verify(personRepo).delete(person);
    }
}
