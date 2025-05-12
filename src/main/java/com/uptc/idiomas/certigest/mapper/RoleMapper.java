package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.RoleDTO;
import com.uptc.idiomas.certigest.entity.Role;

@Mapper
public interface RoleMapper {

    RoleMapper INSTANCE = Mappers.getMapper(RoleMapper.class);

    Role mapRoleDTOToRole(RoleDTO roleDTO);

    RoleDTO mapRoleToRoleDTO(Role role);
}


