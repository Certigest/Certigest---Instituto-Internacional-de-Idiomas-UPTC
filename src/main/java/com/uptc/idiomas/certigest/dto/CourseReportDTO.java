package com.uptc.idiomas.certigest.dto;

import java.util.Date;
import java.util.List;

import com.uptc.idiomas.certigest.entity.Course.CourseType;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseReportDTO {
    private Integer id_course;
    private String course_name;
    private String course_description;
    private CourseType course_type;
    private List<LevelReportDTO> levels;
}