package com.uptc.idiomas.certigest.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uptc.idiomas.certigest.dto.CertificateHistoryDTO;
import com.uptc.idiomas.certigest.service.CertificateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;




@RestController
@RequestMapping("/certificate")
public class CertificateController {
    @Autowired
    CertificateService certificateService;

    @PostMapping("/generateLevelCertificate")
    public String generateLevelCertificate(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> data) {
        String username = jwt.getClaim("preferred_username");
        Integer levelId = ((Number) data.get("levelId")).intValue();
        String certificateType = (String) data.get("certificateType");
        return certificateService.generateLevelCertificate(username, certificateType, levelId);
    }

    @PostMapping("/generateAllLevelsCertificate")
    public String generateAllLevelsCertificate(@AuthenticationPrincipal Jwt jwt, @RequestBody String courseName) {
        String username = jwt.getClaim("preferred_username");
        return certificateService.generateAllLevelsCertificate(username, courseName);
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

    @GetMapping("/validateCdertificate/{id}")
    public String getMethodName(@PathVariable String id) {
        return certificateService.validateCertificate(id);
    }
    
}
