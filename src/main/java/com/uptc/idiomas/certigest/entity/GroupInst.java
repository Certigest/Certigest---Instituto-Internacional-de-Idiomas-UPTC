package com.uptc.idiomas.certigest.entity;

import java.util.Date;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Group_inst")
public class GroupInst {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JoinColumn(name = "group_id")
    private Integer group_id;

    @ManyToOne
    @JoinColumn(name = "level_id")
    private Level level_id;

    @ManyToOne
    @JoinColumn(name = "group_teacher")
    private Person group_teacher;

    private Date start_date;
    private Date end_date;

    private String group_name;
    private String schedule;
}
