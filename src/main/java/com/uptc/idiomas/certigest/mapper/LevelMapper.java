package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.entity.Level;

@Mapper
public interface LevelMapper {
    LevelMapper INSTANCE = Mappers.getMapper(LevelMapper.class);

    Level mapLevelDTOToLevel(LevelDTO levelDTO);

    LevelDTO mapLevelToLevelDTO(Level level);
}
