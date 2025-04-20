package com.uptc.idiomas.certigest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;

import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.service.PersonService;

@RestController
public class PersonController {

    @Autowired
    PersonService personService;

    @PostMapping("/person/addPerson")
    public ResponseEntity<PersonDTO> savePerson(@RequestBody PersonDTO personDTO){
        PersonDTO personAdded = personService.addPersonInDb(personDTO);
        return new ResponseEntity<>(personAdded, HttpStatus.CREATED);
    }
}
