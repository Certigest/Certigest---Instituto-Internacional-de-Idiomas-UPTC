package com.uptc.idiomas.certigest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.entity.Location;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.LocationMapper;
import com.uptc.idiomas.certigest.mapper.PersonMapper;

@Service
public class PersonService extends BasicServiceImpl<Person, Integer> {

    @Autowired
    private JpaRepository<Person, Integer> personRepo;
    @Autowired
    private JpaRepository<Location, Integer> locationRepo;

    @Override
    protected JpaRepository<Person, Integer> getRepo() {
        return personRepo;
    }

    public PersonDTO addPersonInDb(PersonDTO personDTO){
        Location location = LocationMapper.INSTANCE.mapLocationDTOToLocation(personDTO.getLocationId());

        if (location.getIdLocation() == null) {
            location = locationRepo.save(location);
        }

        Person person = PersonMapper.INSTANCE.mapPersonDTOToPerson(personDTO);
        person.setLocation(location);

        Person personSaved = personRepo.save(person);

        return PersonMapper.INSTANCE.mapPersonToPersonDTO(personSaved);
    }
}
