
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

    public enum CourseType { KIDS, DEFAULT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCourse;

    private String courseName;
    private String courseDescription;

    @Enumerated(EnumType.STRING)
    private CourseType courseType;

    private String language;
    private Date creationDate;
}
