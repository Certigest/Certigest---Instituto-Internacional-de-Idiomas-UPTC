package com.uptc.idiomas.certigest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class CredentialsKeycloakService {


    @Value("${keycloak.auth-url}")
    private String keycloakAuthUrl;
    
    public String obtainAdminAccessToken() {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", "admin-cli");
        body.add("username", "admin"); 
        body.add("password", "admin123"); 
        body.add("grant_type", "password");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(keycloakAuthUrl + "/realms/master/protocol/openid-connect/token", request, Map.class);

        return (String) response.getBody().get("access_token");
    }

    public String getUserIdByUsername(String username, String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<List> response = restTemplate.exchange(
                keycloakAuthUrl +"/admin/realms/inst_idiomas_realm/users?username=" + username,
                HttpMethod.GET,
                request,
                List.class);
        
        if (response.getBody() != null && !response.getBody().isEmpty()) {
            Map<String, Object> userData = (Map<String, Object>) response.getBody().get(0);
            return (String) userData.get("id");
        } else {
            throw new RuntimeException("Usuario no encontrado en Keycloak");
        }
    }

    public void resetPassword(String userId, String newPassword, String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> passwordPayload = new HashMap<>();
        passwordPayload.put("type", "password");
        passwordPayload.put("value", newPassword);
        passwordPayload.put("temporary", false);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(passwordPayload, headers);
        
        restTemplate.put(keycloakAuthUrl +"/admin/realms/inst_idiomas_realm/users/" + userId + "/reset-password", request);
    }
}
