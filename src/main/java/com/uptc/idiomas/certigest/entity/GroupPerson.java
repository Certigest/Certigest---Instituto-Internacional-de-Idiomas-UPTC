
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
public class GroupPerson {

    public enum LevelModality { In_person, virtual }

    @Id
    @ManyToOne
    @JoinColumn(name = "person_id")
    private Person person;

    @Id
    @ManyToOne
    @JoinColumn(name = "group_id")
    private GroupInst group;

    private Float calification;
    private Date calificationDate;
    private Date startDate;
    private Date endDate;
    private Integer levelCost;
    private Integer materialCost;

    @Enumerated(EnumType.STRING)
    private LevelModality levelModality;

    private String levelDuration;
}
