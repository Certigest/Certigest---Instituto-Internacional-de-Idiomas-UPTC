package com.uptc.idiomas.certigest.controller;

import com.uptc.idiomas.certigest.dto.CertificateHistoryDTO;
import com.uptc.idiomas.certigest.service.CertificateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.Mockito.*;

public class CertificateControllerTest {

    @Mock
    private CertificateService certificateService;

    @InjectMocks
    private CertificateController certificateController;
    
    @Mock
    private Jwt jwt;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(jwt.getClaim("preferred_username")).thenReturn("testUser");
    }

    @Test
    void testGenerateLevelCertificateWithStringLevelId() {
        
        Map<String, Object> data = new HashMap<>();
        data.put("levelId", "1");
        data.put("certificateType", "LEVEL");
        
        when(certificateService.generateLevelCertificateCode("testUser", "LEVEL", 1))
            .thenReturn("CERT-001");
        
        
        ResponseEntity<Map<String, String>> response = certificateController.generateLevelCertificate(jwt, data);
        
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CERT-001", response.getBody().get("code"));
        verify(certificateService).generateLevelCertificateCode("testUser", "LEVEL", 1);
    }

    @Test
    void testGenerateLevelCertificateWithNumberLevelId() {
        
        Map<String, Object> data = new HashMap<>();
        data.put("levelId", 2);
        data.put("certificateType", "LEVEL");
        
        when(certificateService.generateLevelCertificateCode("testUser", "LEVEL", 2))
            .thenReturn("CERT-002");
        
        
        ResponseEntity<Map<String, String>> response = certificateController.generateLevelCertificate(jwt, data);
        
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CERT-002", response.getBody().get("code"));
    }

    @Test
    void testGenerateAllLevelsCertificate() {
        
        Map<String, Integer> data = new HashMap<>();
        data.put("courseId", 3);
        
        when(certificateService.generateAllLevelsCertificateAndSave("testUser", 3))
            .thenReturn("CERT-ALL-003");
        
        
        ResponseEntity<Map<String, String>> response = certificateController.generateAllLevelsCertificate(jwt, data);
        
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CERT-ALL-003", response.getBody().get("code"));
    }

    @Test
    void testGetCertificatesByPerson() {
        List<CertificateHistoryDTO> certificates = Arrays.asList(
            new CertificateHistoryDTO("Inglés", "A1", "Juan Pérez", "123456", new Date(), "LEVEL", "CERT-001")
        );
        
        when(certificateService.getCertificateHistory("testUser")).thenReturn(certificates);
        
        ResponseEntity<List<CertificateHistoryDTO>> response = certificateController.getCertificatesByPerson(jwt);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Inglés", response.getBody().get(0).getCourseName());
    }

    @Test
    void testGetAllCertificates() {
        List<CertificateHistoryDTO> allCertificates = Arrays.asList(
            new CertificateHistoryDTO("Inglés", "A1", "Juan Pérez", "123456", new Date(), "LEVEL", "CERT-001"),
            new CertificateHistoryDTO("Francés", "B1", "María López", "789012", new Date(), "LEVEL", "CERT-002")
        );
        
        when(certificateService.findAllHistory()).thenReturn(allCertificates);
        
        ResponseEntity<List<CertificateHistoryDTO>> response = certificateController.getAllCertificates();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void testValidateCertificate() {
        
        String certificateId = "CERT-001";
        byte[] pdfContent = "Contenido del PDF".getBytes();
        
        when(certificateService.validateCertificatePdf(certificateId)).thenReturn(pdfContent);
        
        
        ResponseEntity<?> response = certificateController.validateCertificate(certificateId);
        
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MediaType.APPLICATION_PDF, response.getHeaders().getContentType());
        assertArrayEquals(pdfContent, (byte[]) response.getBody());
    }
}