
package com.uptc.idiomas.certigest.entity;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GroupPersonId implements Serializable {
    private Integer person;
    private Integer group;
}
