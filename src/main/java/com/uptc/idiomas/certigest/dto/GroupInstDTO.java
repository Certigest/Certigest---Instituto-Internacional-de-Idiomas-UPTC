package com.uptc.idiomas.certigest.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupInstDTO {
    private Integer group_id;
    private LevelDTO level_id;
    private PersonDTO group_teacher;
    private String group_name;
    private String schedule;
}