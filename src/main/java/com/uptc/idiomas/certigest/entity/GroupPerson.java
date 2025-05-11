package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "group_person")
public class GroupPerson {

    @EmbeddedId
    private GroupPersonId id;

    public enum LevelModality {
        In_person, virtual
    }

    @ManyToOne
    @MapsId("personId")
    @JoinColumn(name = "person_id")
    private Person person_id;

    @ManyToOne
    @MapsId("groupId")
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
