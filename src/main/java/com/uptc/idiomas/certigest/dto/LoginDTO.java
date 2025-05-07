package com.uptc.idiomas.certigest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginDTO {
    private Integer idLogin;
    private PersonDTO person;
    private String userName;
}
