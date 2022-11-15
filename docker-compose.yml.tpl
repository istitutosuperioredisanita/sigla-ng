version: '3'

services:

  siglang:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    environment:
    - 'BASE_URL=https://sigla-main.test.si.cnr.it'
    - 'SSO_APPS_MENU_DISPLAY=true'
    - 'OIDC_ENABLE=true'
    - 'OIDC_AUTHORITY=https://traefik.test.si.cnr.it/auth/realms/cnr/.well-known/openid-configuration'
    network_mode: bridge
    labels:
      SERVICE_NAME: "##{SERVICE_NAME}##"
    tmpfs:
    - /tmp/
