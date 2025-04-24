// keycloak-config.js
import Keycloak from 'keycloak-js';

let keycloakInstance;

if (!keycloakInstance) {
  keycloakInstance = new Keycloak({
    url: 'http://localhost:8081',
    realm: 'inst_idiomas_realm',
    clientId: 'react-client',
  });
}

export default keycloakInstance;
