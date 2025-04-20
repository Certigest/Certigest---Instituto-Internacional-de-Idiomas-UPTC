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
}
