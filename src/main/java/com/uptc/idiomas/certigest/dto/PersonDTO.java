package com.uptc.idiomas.certigest.dto;

import lombok.*;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonDTO {

    private Integer personId;
    private LocationDTO location;

    private String firstName;
    private String lastName;

    private String documentType;
    private String document;
    private String email;
    private String phone;
    private Boolean status;
    private Date birthDate;
}
