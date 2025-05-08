import Keycloak from 'keycloak-js';

const keycloakInstance = new Keycloak({
  url: 'http://localhost:8081/',
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
});

export default keycloakInstance;