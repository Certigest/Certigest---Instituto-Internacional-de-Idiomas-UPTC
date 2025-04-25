package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Login")
public class Login {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_login")
    private Integer idLogin;

    @Column(name = "user_name", nullable = false, unique = true)
    private String userName;

    @OneToOne(optional = false)
    @JoinColumn(name = "id_person", nullable = false, unique = true)
    private Person person;
}
