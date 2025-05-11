package com.uptc.idiomas.certigest.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonDTONote {

    private String firstName;
    private String lastName;
    private String document;
    private String email;
    private Float calification;
}
