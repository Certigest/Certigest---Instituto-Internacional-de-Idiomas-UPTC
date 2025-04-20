package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.entity.Person;

@Mapper
public interface PersonMapper {

    PersonMapper INSTANCE = Mappers.getMapper(PersonMapper.class);

    Person mapPersonDTOToPerson(PersonDTO personDTO);

    PersonDTO mapPersonToPersonDTO(Person person);
}
