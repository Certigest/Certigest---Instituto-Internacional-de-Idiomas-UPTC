package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.CertificateCodeDTO;
import com.uptc.idiomas.certigest.entity.CertificateCode;

public interface CertificateCodeMapper {
    
    CertificateCodeMapper INSTANCE = Mappers.getMapper(CertificateCodeMapper.class);

    CertificateCode mapCertificateCodeDTOToCertificateCode(CertificateCodeDTO CertificateCodeDTO);

    CertificateCodeDTO mapCertificateCodeToCertificateCodeDTO(CertificateCode CertificateCode);
}
