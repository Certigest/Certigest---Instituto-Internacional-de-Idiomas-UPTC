package com.uptc.idiomas.certigest.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LevelDTO {
    private Integer level_id;
    private CourseDTO id_course;
    private String level_name;
    private String level_description;
    private Integer level_cost;
    private Integer material_cost;
    private Boolean state;
    private LevelModality level_modality;

    public enum LevelModality {
        In_person, virtual
    }
    
    private Integer level_duration;
}
