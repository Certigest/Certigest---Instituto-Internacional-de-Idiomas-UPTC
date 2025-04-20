
package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idLocation;
    @Column(name = "id_location_f")
    private Integer idLocationF;
    private String locationName;
}
