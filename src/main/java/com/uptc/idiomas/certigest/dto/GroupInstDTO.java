package com.uptc.idiomas.certigest.dto;

import lombok.Data;

import java.util.Date;

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
    private Date start_date;
    private Date end_date;
    private String schedule;
}