package com.uptc.idiomas.certigest.dto;

import lombok.*;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonDTO {

    private Integer personId;
    private LocationDTO locationId;

    private String firstName;
    private String lastName;

    private String documentType;
    private String document;
    private String email;
    private String phone;
    private Boolean status;
    private Date birthDate;

    private String role;
}
