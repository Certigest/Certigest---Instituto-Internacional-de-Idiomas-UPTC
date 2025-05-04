package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.PersonRoleDTO;
import com.uptc.idiomas.certigest.entity.PersonRole;

@Mapper(uses = { PersonMapper.class, RoleMapper.class })
public interface PersonRoleMapper {

    PersonRoleMapper INSTANCE = Mappers.getMapper(PersonRoleMapper.class);

    PersonRole mapPersonRoleDTOToPersonRole(PersonRoleDTO dto);

    PersonRoleDTO mapPersonRoleToPersonRoleDTO(PersonRole entity);
}
