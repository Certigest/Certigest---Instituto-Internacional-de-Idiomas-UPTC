package com.uptc.idiomas.certigest.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.uptc.idiomas.certigest.dto.CertificateHistoryDTO;
import com.uptc.idiomas.certigest.service.CertificateService;

@RestController
@RequestMapping("/certificate")
public class CertificateController {
    @Autowired
    CertificateService certificateService;

    @PostMapping("/generateLevelCertificate")
    public ResponseEntity<Map<String,String>> generateLevelCertificate(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> data) {
        String username = jwt.getClaim("preferred_username");
        Integer levelId = null;
        if (data.get("levelId").getClass().equals("string".getClass()))
            levelId = Integer.parseInt((String) data.get("levelId"));
        else
            levelId = ((Number) data.get("levelId")).intValue();
        String certificateType= (String) data.get("certificateType");
        String code = certificateService.generateLevelCertificateCode(username, certificateType, levelId);
        return ResponseEntity.ok(Collections.singletonMap("code", code));
    }

    @PostMapping("/generateAllLevelsCertificate")
    public ResponseEntity<Map<String, String>> generateAllLevelsCertificate(@AuthenticationPrincipal Jwt jwt,  @RequestBody Map<String,Integer> data) {
        String username = jwt.getClaim("preferred_username");
        Integer courseId = data.get("courseId"); 
        String code = certificateService.generateAllLevelsCertificateAndSave(username, courseId); 
        Map<String, String> response = new HashMap<>();
        response.put("code", code);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/myCertificates")
    public ResponseEntity<List<CertificateHistoryDTO>> getCertificatesByPerson(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        return ResponseEntity.ok(certificateService.getCertificateHistory(username));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CertificateHistoryDTO>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.findAllHistory());
    }

    @GetMapping("/validateCertificate/{id}")
    public ResponseEntity<byte[]> validateCertificate(@PathVariable String id) {
        byte[] pdfBytes  = certificateService.validateCertificatePdf(id); 
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename("certificado.pdf").build());
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
