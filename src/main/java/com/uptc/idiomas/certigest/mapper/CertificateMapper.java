package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.CertificateDTO;
import com.uptc.idiomas.certigest.entity.Certificate;

@Mapper
public interface CertificateMapper {
    
    CertificateMapper INSTANCE = Mappers.getMapper(CertificateMapper.class);

    Certificate mapCertificateDTOToCertificate(CertificateDTO certificateDTO);

    CertificateDTO mapCertificateToCertificateDTO(Certificate certificate);
}
