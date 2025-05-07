
package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "certificate_code")
public class CertificateCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer validationId;

    @ManyToOne
    @JoinColumn(name = "certificate_id")
    private Certificate certificate;

    @Column(name = "code", nullable = false, unique = true)
    private String code;
}
