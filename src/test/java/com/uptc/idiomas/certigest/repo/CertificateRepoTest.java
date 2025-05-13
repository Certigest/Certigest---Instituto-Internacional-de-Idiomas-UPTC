package com.uptc.idiomas.certigest.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.uptc.idiomas.certigest.entity.Certificate;
import com.uptc.idiomas.certigest.entity.Person;

@DataJpaTest
public class CertificateRepoTest {
    
    @Autowired
    CertificateRepo certificateRepo;
    
    @Autowired
    TestEntityManager entityManager;
    
    private Certificate certificate;
    private Person person;
    
    @BeforeEach
    void setUp() {
        person = new Person();
        person.setFirstName("Test");
        person.setLastName("Person");
        entityManager.persist(person);
        
        certificate = new Certificate();
        certificate.setPerson(person);
        certificate.setCertificateType(Certificate.CertificateType.BASIC);
        certificate.setGenerationDate(new Date());
        entityManager.persist(certificate);
        entityManager.flush();
    }
    
    @Test
    void testFindByPersonId() {
        List<Certificate> certificates = certificateRepo.findByPerson_PersonId(person.getPersonId());
        assertEquals(1, certificates.size());
        assertEquals(certificate.getCertificateId(), certificates.get(0).getCertificateId());
    }
    
    @Test
    void testFindByCertificateType() {
        List<Certificate> certificates = certificateRepo.findByCertificateType(Certificate.CertificateType.BASIC);
        assertEquals(1, certificates.size());
        assertEquals(certificate.getCertificateId(), certificates.get(0).getCertificateId());
    }
    
    @Test
    void testFindByGenerationDateBetween() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, -1);
        Date startDate = cal.getTime();
        
        cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, 1);
        Date endDate = cal.getTime();
        
        List<Certificate> certificates = certificateRepo.findByGenerationDateBetween(startDate, endDate);
        assertEquals(1, certificates.size());
        assertEquals(certificate.getCertificateId(), certificates.get(0).getCertificateId());
    }
    
    @Test
    void testDeleteByPersonId() {
        certificateRepo.deleteByPersonId(person.getPersonId());
        entityManager.flush();
        
        List<Certificate> certificates = certificateRepo.findByPerson_PersonId(person.getPersonId());
        assertTrue(certificates.isEmpty());
    }
}