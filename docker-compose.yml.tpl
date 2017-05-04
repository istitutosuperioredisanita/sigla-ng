version: '3'

services:

  siglang:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    read_only: true
    network_mode: bridge
    tmpfs:
    - /tmp/

  nginx:
    image: nginx:1.13-alpine
    network_mode: bridge
    links:
    - siglang:siglang
    labels:
    - SERVICE_NAME=##{SERVICE_NAME}##
    read_only: true
    volumes:
    - ./conf.d/:/etc/nginx/conf.d/
