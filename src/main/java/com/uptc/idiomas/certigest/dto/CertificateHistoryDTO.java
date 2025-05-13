package com.uptc.idiomas.certigest.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateHistoryDTO  {
    private String courseName;
    private String levelName;
    private String fullName;
    private String personId;
    private Date generationDate;
    private String certificateType;
    private String code;
}
