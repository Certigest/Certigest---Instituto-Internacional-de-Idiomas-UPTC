package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRepo extends JpaRepository<Certificate, Integer> {
    
    // Buscar certificados por persona
    List<Certificate> findByPerson_PersonId(Integer personId);

    // Buscar certificados por tipo
    List<Certificate> findByCertificateType(Certificate.CertificateType certificateType);

    // Buscar certificados por fecha de generación
    List<Certificate> findByGenerationDateBetween(java.util.Date startDate, java.util.Date endDate);
}