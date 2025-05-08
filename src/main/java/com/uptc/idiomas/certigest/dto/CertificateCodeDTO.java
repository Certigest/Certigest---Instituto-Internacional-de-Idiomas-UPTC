package com.uptc.idiomas.certigest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateCodeDTO {
    private Integer validationId;
    private CertificateDTO certificate;
    private String code;
}
