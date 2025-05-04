package com.uptc.idiomas.certigest.entity;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PersonRoleId implements Serializable {
    private Integer role;
    private Integer person;
}
