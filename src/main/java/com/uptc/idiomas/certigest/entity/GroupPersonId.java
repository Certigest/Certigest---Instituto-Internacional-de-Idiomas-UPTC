
package com.uptc.idiomas.certigest.entity;

import lombok.*;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class GroupPersonId implements Serializable {
    @Column(name = "person_id")
    private Integer personId;

    @Column(name = "group_id")
    private Integer groupId;
}
