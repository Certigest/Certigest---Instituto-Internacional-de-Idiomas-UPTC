package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.CertificateLevel;
import com.uptc.idiomas.certigest.entity.CertificateLevelId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateLevelRepo extends JpaRepository<CertificateLevel, CertificateLevelId> {
}
