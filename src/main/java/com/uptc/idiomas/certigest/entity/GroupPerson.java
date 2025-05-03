package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@IdClass(GroupPersonId.class)
@Table(name = "Group_Person")
public class GroupPerson {

    public enum LevelModality {
        In_person, virtual
    }

    @Id
    @ManyToOne
    private Person person_id;

    @Id
    @ManyToOne
    @JoinColumn(name = "group_id")
    private GroupInst group_id;

    private Float calification;
    private Date calificationDate;
    private Date start_date;
    private Date end_date;
    private Integer level_cost;
    private Integer material_cost;

    @Enumerated(EnumType.STRING)
    private LevelModality LEVEL_MODALITY;

    private String level_duration;
}
