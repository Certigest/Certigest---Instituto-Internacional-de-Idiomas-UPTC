
package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "certificate_Code")
public class CertificateCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer validationId;

    @ManyToOne
    @JoinColumn(name = "certificate_id")
    private Certificate certificate;

    private String code;
}
