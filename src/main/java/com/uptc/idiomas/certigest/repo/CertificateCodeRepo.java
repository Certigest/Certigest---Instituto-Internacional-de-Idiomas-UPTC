package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.CertificateCode;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateCodeRepo extends JpaRepository<CertificateCode, Integer> {

    @Modifying
    @Query("DELETE FROM CertificateCode cc WHERE cc.certificate.certificateId IN :ids")
    void deleteByCertificateIdIn(@Param("ids") List<Integer> certificateIds);

    @Query("SELECT COUNT(cc) > 0 FROM CertificateCode cc WHERE cc.certificate.person.personId = :personId")
    boolean existsByPersonId(@Param("personId") int personId);
    boolean existsByCode(String code);

    
    @Query("SELECT cc FROM CertificateCode cc WHERE cc.certificate.certificateId = :certificateId")
    CertificateCode findByCertificateId(@Param("certificateId") Integer certificateId);

    CertificateCode findByCode(String code);
}
