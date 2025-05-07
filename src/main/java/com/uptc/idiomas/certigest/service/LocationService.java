package com.uptc.idiomas.certigest.service;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.LocationDTO;
import com.uptc.idiomas.certigest.entity.Location;
import com.uptc.idiomas.certigest.repo.LocationRepo;

@Service
public class LocationService {

    @Autowired
    private LocationRepo locationRepo;

    public List<LocationDTO> getLocationsByParentId(Integer parentId) {
        List<Location> locations = parentId == null
                ? locationRepo.findByParentIdLocation(null)
                : locationRepo.findByParentIdLocation(parentId);

        return locations.stream().map(location -> new LocationDTO(
                location.getIdLocation(),
                location.getLocationName(),
                null // no incluimos el padre para evitar recursión infinita
        )).collect(Collectors.toList());
    }
}
