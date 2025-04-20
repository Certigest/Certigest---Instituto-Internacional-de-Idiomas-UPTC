package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.CertificateCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateCodeRepo extends JpaRepository<CertificateCode, Integer> {
}
