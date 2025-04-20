
package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Person {

    public enum DocumentType { CC, TI }
    public enum Role { STUDENT, TEACHER, ADMIN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer personId;

    @ManyToOne
    @JoinColumn(name = "id_location")
    private Location location;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String document;
    private String email;
    private String phone;
    private Boolean status;
    private Date birthDate;

    @Enumerated(EnumType.STRING)
    private Role role;
}
