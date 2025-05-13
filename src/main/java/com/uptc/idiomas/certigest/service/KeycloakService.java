package com.uptc.idiomas.certigest.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RoleMappingResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para interactuar con el servidor de Keycloak.
 * Permite crear y eliminar usuarios, así como asignarles roles.
 */
@Service
public class KeycloakService {

    private final Keycloak keycloak;
    private final String realm;

    /**
     * Constructor para inicializar el cliente de Keycloak con credenciales administrativas.
     *
     * @param serverUrl URL del servidor Keycloak.
     * @param realm     Realm donde se gestionan los usuarios.
     * @param clientId  ID del cliente (no se usa directamente, requerido para compatibilidad con configuración).
     */
    public KeycloakService(
            @Value("${keycloak.auth-url}") String serverUrl,
            @Value("${keycloak.realm}") String realm,
            @Value("${keycloak.resource}") String clientId) {
        this.keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master") // Se usa el realm master para autenticación de administrador
                .username("admin") // Usuario administrador
                .password("admin123") // Contraseña del administrador
                .clientId("admin-cli")
                .build();
        this.realm = realm;
    }

    /**
     * Crea un nuevo usuario en Keycloak con roles especificados.
     *
     * @param username Nombre de usuario.
     * @param email    Correo electrónico del usuario.
     * @param password Contraseña del usuario.
     * @param roles    Lista de nombres de roles a asignar.
     */
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

        RoleMappingResource rolesResource = keycloak.realm(realm).users().get(userId).roles();
        List<RoleRepresentation> realmRoles = keycloak.realm(realm).roles().list();

        List<RoleRepresentation> rolesToAssign = realmRoles.stream()
                .filter(r -> roles.contains(r.getName().toLowerCase()))
                .collect(Collectors.toList());

        rolesResource.realmLevel().add(rolesToAssign);
    }

    /**
     * Elimina un usuario en Keycloak por su nombre de usuario.
     *
     * @param username Nombre de usuario a eliminar.
     */
    public void deleteUserByUsername(String username) {
        List<UserRepresentation> users = keycloak.realm(realm)
                .users()
                .search(username, true);

        if (!users.isEmpty()) {
            String userId = users.get(0).getId();
            keycloak.realm(realm).users().delete(userId);
        }
    }
}
