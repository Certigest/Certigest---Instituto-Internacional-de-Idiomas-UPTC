
package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Course {

    public enum CourseType {
        KIDS, DEFAULT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_course;

    private String course_name;
    private String course_description;

    @Enumerated(EnumType.STRING)
    private CourseType course_type;

    private String language;
    private Date creation_date;
}
