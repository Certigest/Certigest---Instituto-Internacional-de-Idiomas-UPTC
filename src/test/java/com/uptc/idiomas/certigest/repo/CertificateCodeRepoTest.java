package com.uptc.idiomas.certigest.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.uptc.idiomas.certigest.entity.Certificate;
import com.uptc.idiomas.certigest.entity.CertificateCode;
import com.uptc.idiomas.certigest.entity.Person;

@DataJpaTest
public class CertificateCodeRepoTest {
    
    @Autowired
    CertificateCodeRepo certificateCodeRepo;
    
    @Autowired
    TestEntityManager entityManager;
    
    private CertificateCode certificateCode;
    private Certificate certificate;
    private Person person;
    
    @BeforeEach
    void setUp() {
        person = new Person();
        person.setFirstName("Test");
        person.setLastName("Person");
        person = entityManager.persist(person);
        
        certificate = new Certificate();
        certificate.setPerson(person);
        certificate = entityManager.persist(certificate);
        
        certificateCode = new CertificateCode();
        certificateCode.setCertificate(certificate);
        certificateCode.setCode("TEST123");
        certificateCode = entityManager.persist(certificateCode);
        
        entityManager.flush();
    }
    
    @Test
    void testDeleteByCertificateIdIn() {
        certificateCodeRepo.deleteByCertificateIdIn(Arrays.asList(certificate.getCertificateId()));
        entityManager.flush();
        
        assertTrue(certificateCodeRepo.findAll().isEmpty());
    }
    
    @Test
    void testExistsByPersonId() {
        boolean exists = certificateCodeRepo.existsByPersonId(person.getPersonId());
        assertTrue(exists);
    }
    
    @Test
    void testExistsByCode() {
        boolean exists = certificateCodeRepo.existsByCode("TEST123");
        assertTrue(exists);
        
        boolean notExists = certificateCodeRepo.existsByCode("INVALID");
        assertFalse(notExists);
    }
    
    @Test
    void testFindByCertificateId() {
        CertificateCode found = certificateCodeRepo.findByCertificateId(certificate.getCertificateId());
        assertNotNull(found);
        assertEquals("TEST123", found.getCode());
    }
    
    @Test
    void testFindByCode() {
        CertificateCode found = certificateCodeRepo.findByCode("TEST123");
        assertNotNull(found);
        assertEquals(certificate.getCertificateId(), found.getCertificate().getCertificateId());
    }
}