package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.entity.GroupInst;

@Mapper
public interface GroupInstMapper {
    GroupInstMapper INSTANCE = Mappers.getMapper(GroupInstMapper.class);

    GroupInst mapGroupInstDTOToGroupInst(GroupInstDTO dto);

    GroupInstDTO mapGroupInstToGroupInstDTO(GroupInst entity);
}
