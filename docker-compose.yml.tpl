version: '3'

services:

  siglang:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    environment:
    - 'BASE_URL=http://sigla-main.test.si.cnr.it'
    - 'SSO_APPS_MENU_DISPLAY=true'
    - 'OIDC_ENABLE=true'
    network_mode: bridge
    labels:
      SERVICE_NAME: "##{SERVICE_NAME}##"
    tmpfs:
    - /tmp/
