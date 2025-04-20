package com.uptc.idiomas.certigest.dto;

import java.util.Date;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseDTO {
    private Integer id_course;
    private String course_name;
    private String course_description;
    private String course_type;
    private String language;
    private Date creation_date;
}
