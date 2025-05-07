package com.uptc.idiomas.certigest.service;


import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RoleMappingResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KeycloakService {

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakService(
        @Value("${keycloak.auth-server-url}") String serverUrl,
        @Value("${keycloak.realm}") String realm,
        @Value("${keycloak.resource}") String clientId
    ) {
        this.keycloak = KeycloakBuilder.builder()
            .serverUrl(serverUrl)
            .realm("master") // Usamos "master" para autenticación admin
            .username("admin") // admin de keycloak
            .password("admin123") // contraseña
            .clientId("admin-cli")
            .build();
        this.realm = realm;
    }

    public void createUser(String username, String email, String password, List<String> roles) {
        UserRepresentation user = new UserRepresentation();
        user.setEnabled(true);
        user.setUsername(username);
        user.setEmail(email);

        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setTemporary(false);
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setValue(password);

        user.setCredentials(Collections.singletonList(cred));

        Response response = keycloak.realm(realm).users().create(user);

        if (response.getStatus() != 201) {
            throw new RuntimeException("Error creando usuario en Keycloak: " + response.getStatus());
        }

        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

        // Asignar roles del realm
        RoleMappingResource rolesResource = keycloak.realm(realm).users().get(userId).roles();
        List<RoleRepresentation> realmRoles = keycloak.realm(realm).roles().list();

        List<RoleRepresentation> rolesToAssign = realmRoles.stream()
            .filter(r -> roles.contains(r.getName().toLowerCase()))
            .collect(Collectors.toList());

        rolesResource.realmLevel().add(rolesToAssign);
    }
}
