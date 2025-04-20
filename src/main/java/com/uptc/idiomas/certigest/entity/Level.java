
package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Level {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer levelId;

    @ManyToOne
    @JoinColumn(name = "id_course")
    private Course course;

    private String levelName;
    private String levelDescription;
}
