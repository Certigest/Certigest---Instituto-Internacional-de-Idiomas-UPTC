
package com.uptc.idiomas.certigest.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class GroupPersonId implements Serializable {
    private Integer person_id;
    private Integer group_id;
}
