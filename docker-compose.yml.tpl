version: '3'

services:

  siglang:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    environment:
    - 'BASE_URL=https://sigla-main.test.si.cnr.it'
    - 'SSO_APPS_MENU_DISPLAY=true'
    network_mode: bridge
    labels:
      SERVICE_NAME: "##{SERVICE_NAME}##"
    tmpfs:
    - /tmp/
