package com.uptc.idiomas.certigest.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PersonRoleDTO {
    private PersonDTO person;
    private RoleDTO role;
}
