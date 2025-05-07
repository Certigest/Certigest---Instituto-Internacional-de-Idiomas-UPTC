package com.uptc.idiomas.certigest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.uptc.idiomas.certigest.dto.CredentialDTO;
import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.service.CredentialsKeycloakService;
import com.uptc.idiomas.certigest.service.PersonService;

@RestController
@RequestMapping("/person")
public class PersonController {

    @Autowired
    PersonService personService;
    @Autowired
    CredentialsKeycloakService credentialsKeycloakService;

    @PostMapping("/addPerson")
    public ResponseEntity<PersonDTO> savePerson(@RequestBody PersonDTO personDTO) {
        PersonDTO personAdded = personService.addPersonInDb(personDTO);
        return new ResponseEntity<>(personAdded, HttpStatus.CREATED);
    }

    @GetMapping("/allPerson")
    public ResponseEntity<List<PersonDTO>> getAllPersons() {
        List<PersonDTO> persons = personService.getAllPersons();
        return ResponseEntity.ok(persons);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePerson(@PathVariable Integer id) {
        try {
            personService.deletePersonById(id);
            return new ResponseEntity<>("Persona eliminada exitosamente", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error al eliminar persona: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonDTO> getPersonById(@PathVariable Integer id) {
        PersonDTO person = personService.findById(id);
        return person != null ? ResponseEntity.ok(person) : ResponseEntity.notFound().build();
    }

    @GetMapping("/personal-account")
    public ResponseEntity<PersonDTO> getAccountInfo(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        PersonDTO personInfo = personService.getAccountInfoByUsername(username);
        return new ResponseEntity<>(personInfo, HttpStatus.OK);
    }

    @PostMapping("/modify-personal-account")
    public ResponseEntity<PersonDTO> modifyAccountInfo(@AuthenticationPrincipal Jwt jwt,
            @RequestBody PersonDTO personDTO) {
        String username = jwt.getClaim("preferred_username");
        PersonDTO personInfo = personService.ModifyAccountInfo(personDTO, username);
        return new ResponseEntity<>(personInfo, HttpStatus.OK);
    }

    @PostMapping("/modifyPassword")
    public ResponseEntity<String> updatePassword(@AuthenticationPrincipal Jwt jwt,
            @RequestBody CredentialDTO credential) {
        try {
            String accessToken = credentialsKeycloakService.obtainAdminAccessToken();
            String userId = credentialsKeycloakService.getUserIdByUsername(jwt.getClaimAsString("preferred_username"),
                    accessToken); // Paso 2
            credentialsKeycloakService.resetPassword(userId, credential.getPassword(), accessToken);

            return new ResponseEntity<>("Contraseña actualizada", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar contraseña: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/students")
    public List<PersonDTO> getStudents() {
        return personService.getStudents();
    }

    @GetMapping("/admins")
    public List<PersonDTO> getAdmins() {
        return personService.getAdmins();
    }

    @GetMapping("/teachers")
    public List<PersonDTO> getTeachers() {
        return personService.getTeachers();
    }
}
