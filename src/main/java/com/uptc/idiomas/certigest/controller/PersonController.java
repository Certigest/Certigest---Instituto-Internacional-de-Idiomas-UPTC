package com.uptc.idiomas.certigest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/person/personal-account")
    public ResponseEntity<PersonDTO> getAccountInfo(@AuthenticationPrincipal Jwt jwt){
        String email = jwt.getClaim("email");
        PersonDTO personInfo = personService.getAccountInfoByEmail(email);
        return new ResponseEntity<>(personInfo, HttpStatus.FOUND);
    }

    @PostMapping("/person/modify-personal-account")
    public ResponseEntity<PersonDTO> modifyAccountInfo(@AuthenticationPrincipal Jwt jwt, @RequestBody PersonDTO personDTO){
        String email = jwt.getClaim("email");
        PersonDTO personInfo = personService.ModifyAccountInfo(personDTO, email);
        return new ResponseEntity<>(personInfo, HttpStatus.OK);
    }
}
