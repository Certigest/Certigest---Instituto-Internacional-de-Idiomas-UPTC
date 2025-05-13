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

/**
 * Controlador REST para la gestión de certificados en la plataforma.
 * Proporciona endpoints para generar certificados por nivel, por todos los
 * niveles,
 * obtener certificados del usuario autenticado, listar todos los certificados
 * y validar certificados por código.
 */
@RestController
@RequestMapping("/certificate")
public class CertificateController {
    @Autowired
    CertificateService certificateService;

    /**
     * Genera un certificado para un nivel específico asociado al usuario
     * autenticado.
     *
     * @param jwt  Token JWT del usuario autenticado.
     * @param data Mapa con los datos necesarios, incluyendo:
     *             <ul>
     *             <li><b>levelId</b>: ID del nivel (entero o string convertible a
     *             entero)</li>
     *             <li><b>certificateType</b>: Tipo de certificado a generar</li>
     *             </ul>
     * @return ResponseEntity con un mapa que contiene el código del certificado
     *         generado.
     */
    @PostMapping("/generateLevelCertificate")
    public ResponseEntity<Map<String, String>> generateLevelCertificate(@AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> data) {
        String username = jwt.getClaim("preferred_username");
        Integer levelId = null;
        if (data.get("levelId").getClass().equals("string".getClass()))
            levelId = Integer.parseInt((String) data.get("levelId"));
        else
            levelId = ((Number) data.get("levelId")).intValue();
        String certificateType = (String) data.get("certificateType");
        String code = certificateService.generateLevelCertificateCode(username, certificateType, levelId);
        return ResponseEntity.ok(Collections.singletonMap("code", code));
    }

    /**
     * Genera y guarda un certificado que abarca todos los niveles del curso
     * indicado para el usuario autenticado.
     *
     * @param jwt  Token JWT del usuario autenticado.
     * @param data Mapa con la clave <b>courseId</b> que indica el ID del curso.
     * @return ResponseEntity con un mapa que contiene el código del certificado
     *         generado.
     */
    @PostMapping("/generateAllLevelsCertificate")
    public ResponseEntity<Map<String, String>> generateAllLevelsCertificate(@AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Integer> data) {
        String username = jwt.getClaim("preferred_username");
        Integer courseId = data.get("courseId");
        String code = certificateService.generateAllLevelsCertificateAndSave(username, courseId);
        Map<String, String> response = new HashMap<>();
        response.put("code", code);
        return ResponseEntity.ok(response);
    }

    /**
     * Genera un certificado para un curso específico asociado al usuario
     * autenticado.
     *
     * @param jwt  Token JWT del usuario autenticado.
     * @param data Mapa con la clave <b>courseId</b> que indica el ID del curso.
     * @return ResponseEntity con un mapa que contiene el código del certificado
     *         generado.
     */
    @GetMapping("/myCertificates")
    public ResponseEntity<List<CertificateHistoryDTO>> getCertificatesByPerson(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        return ResponseEntity.ok(certificateService.getCertificateHistory(username));
    }

    /**
     * Obtiene todos los certificados generados en la plataforma.
     *
     * @return ResponseEntity con una lista de objetos CertificateHistoryDTO que
     *         representan los certificados generados.
     */
    @GetMapping("/all")
    public ResponseEntity<List<CertificateHistoryDTO>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.findAllHistory());
    }

    /**
     * Valida un certificado utilizando su código único y devuelve el PDF del
     * certificado.
     *
     * @param id Código único del certificado a validar.
     * @return ResponseEntity con el PDF del certificado y encabezados adecuados.
     */
    @GetMapping("/validateCertificate/{id}")
    public ResponseEntity<byte[]> validateCertificate(@PathVariable String id) {
        byte[] pdfBytes = certificateService.validateCertificatePdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename("certificado.pdf").build());
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
