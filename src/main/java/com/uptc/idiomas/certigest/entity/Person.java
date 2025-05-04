
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

    public enum DocumentType {
        CC, TI
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer personId;

    @ManyToOne(fetch = FetchType.EAGER)
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
}
