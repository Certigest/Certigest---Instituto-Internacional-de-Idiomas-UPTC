
package com.uptc.idiomas.certigest.entity;

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
    private Integer group_id;

    @ManyToOne
    private Level level_id;

    @ManyToOne
    private Person group_teacher;

    private String group_name;
    private String schedule;
}
