package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.LocationDTO;
import com.uptc.idiomas.certigest.entity.Location;

@Mapper
public interface LocationMapper {

    LocationMapper INSTANCE = Mappers.getMapper(LocationMapper.class);

    Location mapLocationDTOToLocation(LocationDTO locationDTO);

    LocationDTO mapLocationToLocationDTO(Location location);
}
