package com.uptc.idiomas.certigest.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
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
    public ResponseEntity<byte[]> generateLevelCertificate(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> data) {
        String username = jwt.getClaim("preferred_username");
        Integer levelId = ((Number) data.get("levelId")).intValue();
        String certificateType = (String) data.get("certificateType");

        byte[] pdf = certificateService.generateLevelCertificatePdf(username, certificateType, levelId);
        return buildPdfResponse(pdf, "level_certificate.pdf");
    }

    @PostMapping("/generateAllLevelsCertificate")
    public ResponseEntity<byte[]> generateAllLevelsCertificate(@AuthenticationPrincipal Jwt jwt, @RequestBody String courseName) {
        String username = jwt.getClaim("preferred_username");
        byte[] pdf = certificateService.generateAllLevelsCertificatePdf(username, courseName);
        return buildPdfResponse(pdf, "all_levels_certificate.pdf");
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
        byte[] pdf = certificateService.validateCertificatePdf(id);  // Este método debe generar y retornar el PDF si es válido
        return buildPdfResponse(pdf, "validated_certificate.pdf");
    }

    private ResponseEntity<byte[]> buildPdfResponse(byte[] pdfBytes, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData(filename, filename);
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
