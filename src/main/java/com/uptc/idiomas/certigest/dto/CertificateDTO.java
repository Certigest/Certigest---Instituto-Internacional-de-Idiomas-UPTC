package com.uptc.idiomas.certigest.dto;

import java.util.Date;

import com.uptc.idiomas.certigest.entity.Certificate.CertificateType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateDTO {
    private Integer certificateId;
    private PersonDTO person;
    private CertificateType certificateType;
    private Date generationDate;
}
