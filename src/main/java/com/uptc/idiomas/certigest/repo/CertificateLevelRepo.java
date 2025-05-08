package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.CertificateLevel;
import com.uptc.idiomas.certigest.entity.CertificateLevelId;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateLevelRepo extends JpaRepository<CertificateLevel, CertificateLevelId> {
    @Modifying
    @Query("DELETE FROM CertificateLevel cl WHERE cl.certificate.certificateId IN :ids")
    void deleteByCertificateIdIn(@Param("ids") List<Integer> certificateIds);
    List<CertificateLevel> findByCertificate_CertificateId(Integer certificateId);
}
