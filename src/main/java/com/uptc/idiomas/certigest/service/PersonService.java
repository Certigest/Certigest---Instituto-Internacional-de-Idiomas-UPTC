package com.uptc.idiomas.certigest.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.entity.Location;
import com.uptc.idiomas.certigest.entity.Login;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.LocationMapper;
import com.uptc.idiomas.certigest.mapper.PersonMapper;
import com.uptc.idiomas.certigest.repo.LocationRepo;
import com.uptc.idiomas.certigest.repo.LoginRepo;
import com.uptc.idiomas.certigest.repo.PersonRepo;

@Service
public class PersonService extends BasicServiceImpl<PersonDTO, Person, Integer> {

    @Autowired
    private PersonRepo personRepo;
    @Autowired
    private LocationRepo locationRepo;
    @Autowired
    private LoginRepo loginRepo;

    @Override
    protected JpaRepository<Person, Integer> getRepo() {
        return personRepo;
    }

    public PersonDTO addPersonInDb(PersonDTO personDTO) {
        Location location = LocationMapper.INSTANCE.mapLocationDTOToLocation(personDTO.getLocationId());

        if (location.getIdLocation() == null) {
            location = locationRepo.save(location);
        }

        Person person = PersonMapper.INSTANCE.mapPersonDTOToPerson(personDTO);
        person.setLocation(location);

        Person personSaved = personRepo.save(person);

        String[] nameParts = personDTO.getFirstName().trim().split("\\s+");
        String[] lastNameParts = personDTO.getLastName().trim().split("\\s+");
        String baseUsername = nameParts[0].toLowerCase() + lastNameParts[0].toLowerCase();

        int count = 1;
        String finalUsername;
        do {
            finalUsername = baseUsername + count;
            count++;
        } while (loginRepo.existsByUserName(finalUsername));

        Login login = new Login();
        login.setUserName(finalUsername);
        login.setPerson(personSaved);

        loginRepo.save(login);

        return PersonMapper.INSTANCE.mapPersonToPersonDTO(personSaved);
    }

    public PersonDTO getAccountInfoByEmail(String email) {
        Optional<Person> personOpt = personRepo.findByEmail(email);
        Person personInfo = null;
        if (personOpt.isPresent())
            personInfo = personOpt.get();
        else
            personInfo = new Person();
        return PersonMapper.INSTANCE.mapPersonToPersonDTO(personInfo);
    }

    public PersonDTO getAccountInfoByUsername(String username) {
        Optional<Login> loginOpt = loginRepo.findByUserName(username);
        Person personInfo = loginOpt.map(Login::getPerson).orElseGet(Person::new);
        return PersonMapper.INSTANCE.mapPersonToPersonDTO(personInfo);
    }

    public PersonDTO ModifyAccountInfo(PersonDTO personDTO, String username) {

        Optional<Login> personOpt = loginRepo.findByUserName(username);
        Person person = personOpt.map(Login::getPerson).orElseGet(Person::new);
        if (personOpt.isPresent()) {

            person.setFirstName(personDTO.getFirstName());
            person.setLastName(personDTO.getLastName());
            Person.DocumentType documentType = Person.DocumentType.valueOf(personDTO.getDocumentType().toUpperCase());
            person.setDocumentType(documentType);
            person.setDocument(personDTO.getDocument());
            person.setPhone(personDTO.getPhone());
            person.setBirthDate(personDTO.getBirthDate());

            if (personDTO.getLocationId() != null) {
                Location location = LocationMapper.INSTANCE.mapLocationDTOToLocation(personDTO.getLocationId());
                if (location.getIdLocation() == null) {
                    location = locationRepo.save(location);
                }
                person.setLocation(location);
            }
        }
        Person updatedPerson = personRepo.save(person);
        return PersonMapper.INSTANCE.mapPersonToPersonDTO(updatedPerson);
    }

    @Override
    protected Person toEntity(PersonDTO dto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'toEntity'");
    }

    @Override
    protected PersonDTO toDTO(Person entity) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'toDTO'");
    }

    public Person getPersonByUserName(String username) {
        return loginRepo.findByUserName(username)
            .map(Login::getPerson)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
    }
}
