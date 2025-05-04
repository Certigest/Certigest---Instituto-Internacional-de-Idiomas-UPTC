package com.uptc.idiomas.certigest.dto;

import com.uptc.idiomas.certigest.entity.Role.RoleName;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoleDTO {
    private Integer roleId;
    private RoleName name;
}
