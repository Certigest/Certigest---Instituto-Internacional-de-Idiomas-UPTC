package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "level")
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer level_id;

    @ManyToOne
    @JoinColumn(name = "id_course")
    private Course id_course;

    private String level_name;
    private String level_description;
    private Integer level_cost;
    private Integer material_cost;
    private Boolean state;
    public enum LevelModality {
        In_person, virtual
    }
    @Enumerated(EnumType.STRING)
    private LevelModality level_modality;
    
    private Integer level_duration;
}
