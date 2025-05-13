package com.uptc.idiomas.certigest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.service.PersonService;
import com.uptc.idiomas.certigest.service.CredentialsKeycloakService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.mockito.ArgumentMatchers.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PersonController.class)
@WithMockUser(username = "testuser", roles = {"USER", "ADMIN"})
class PersonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PersonService personService;

    @MockitoBean
    private CredentialsKeycloakService credentialsKeycloakService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetPersonById() throws Exception {
        PersonDTO personDTO = new PersonDTO();
        personDTO.setPersonId(1);
        personDTO.setFirstName("Carlos");

        Mockito.when(personService.findById(1)).thenReturn(personDTO);

        mockMvc.perform(get("/person/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Carlos"));
    }

    void testSavePerson() throws Exception {
        PersonDTO personDTO = new PersonDTO();
        personDTO.setFirstName("Carlos");
        personDTO.setLastName("Lopez");
        personDTO.setEmail("test@example.com");

        Mockito.when(personService.addPersonInDb(any())).thenReturn(personDTO);

        mockMvc.perform(post("/person/addPerson")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(personDTO))
                        .with(jwt().jwt(jwt -> jwt.claim("preferred_username", "testuser")))) 
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Carlos"));
    }

    @Test
    void testModifyAccountInfo() throws Exception {
        PersonDTO updatedPerson = new PersonDTO();
        updatedPerson.setFirstName("Updated");

        Mockito.when(personService.ModifyAccountInfo(any(), anyString())).thenReturn(updatedPerson);

        mockMvc.perform(post("/person/modify-personal-account")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedPerson))
                        .with(jwt().jwt(jwt -> jwt.claim("preferred_username", "testuser")
                                .claim("roles", List.of("ROLE_USER", "ROLE_ADMIN"))))) 
                .andExpect(status().isOk()) 
                .andExpect(jsonPath("$.firstName").value("Updated"));
    }

    @Test
    void testGetStudents() throws Exception {
        PersonDTO student = new PersonDTO();
        student.setFirstName("Student");

        Mockito.when(personService.getStudents()).thenReturn(List.of(student));

        mockMvc.perform(get("/person/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Student"));
    }

    @Test
    void testGetAccountInfo() throws Exception {
        mockMvc.perform(get("/person/personal-account")
                .with(jwt().jwt(jwt -> jwt.claim("preferred_username", "testuser"))))
            .andExpect(status().isOk());
    }
}
