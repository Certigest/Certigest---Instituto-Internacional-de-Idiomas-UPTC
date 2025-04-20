package com.uptc.idiomas.certigest.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationDTO {
    private Integer idLocation;
    private String locationName;
    private LocationDTO parent;
}
