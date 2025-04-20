
package com.uptc.idiomas.certigest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@IdClass(CertificateLevelId.class)
public class CertificateLevel {

    @Id
    @ManyToOne
    @JoinColumn(name = "certificate_id")
    private Certificate certificate;

    @Id
    @ManyToOne
    @JoinColumn(name = "level_id")
    private Level level;
}
