package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.GroupPersonDTO;
import com.uptc.idiomas.certigest.entity.GroupPerson;

@Mapper
public interface GroupPersonMapper {
    GroupPersonMapper INSTANCE = Mappers.getMapper(GroupPersonMapper.class);

    GroupPerson mapGroupPersonDTOToGroupPerson(GroupPersonDTO dto);

    GroupPersonDTO mapGroupPersonToGroupPersonDTO(GroupPerson entity);
}
