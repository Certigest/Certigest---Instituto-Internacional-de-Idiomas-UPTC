
package com.uptc.idiomas.certigest.entity;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CertificateLevelId implements Serializable {
    private Integer certificate;
    private Integer level;
}
