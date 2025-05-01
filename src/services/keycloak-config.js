import Keycloak from 'keycloak-js';

let keycloakInstance;

if (!keycloakInstance) {
  keycloakInstance = new Keycloak({
    url: 'https://auth.certigestdev.click:8443/',
    realm: 'inst_idiomas_realm',
    clientId: 'react-client',
    redirectUri: 'https://d16uzpy2u8y3eb.cloudfront.net/',
  });
}

export default keycloakInstance;