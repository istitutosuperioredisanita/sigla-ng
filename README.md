# SIGLA NG - _Sistema Informativo Gestione Linee di Attività_

[![license](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![maven central](https://img.shields.io/maven-central/v/it.cnr.si.sigla/sigla-ng.svg?style=flat)](https://mvnrepository.com/artifact/it.cnr.si.sigla/sigla-ng)
[![Docker Stars](https://img.shields.io/docker/stars/consiglionazionalericerche/sigla-ng.svg)](https://hub.docker.com/r/consiglionazionalericerche/sigla-ng/)
[![Docker Pulls](https://img.shields.io/docker/pulls/consiglionazionalericerche/sigla-ng.svg)](https://hub.docker.com/r/consiglionazionalericerche/sigla-ng/)
[![docs](https://img.shields.io/travis/consiglionazionaledellericerche/sigla-main.svg?label=docs)](https://consiglionazionaledellericerche.github.io/sigla-main)

# Premessa

La modifica delle caratteristiche di presentazione delle funzionalità di [SIGLA](https://github.com/consiglionazionaledellericerche/sigla-main) 
non cambia in alcun modo i processi amministrativi previsti, né influenza dati e utilizzo degli stessi.

# Introduzione

Il progetto è nato con l’obiettivo della revisione dell’intero layout della procedura [SIGLA](https://github.com/consiglionazionaledellericerche/sigla-main) 
ed è esclusivamente quello di rendere più ‘usabile’ le funzionalità. In alcuni casi la revisione ha riguardato l’aggiunta di utilità importanti sempre al fine di migliorare la navigazione e la gestione delle mappe.
Per ulteriori informazioni consultare il [Manuale di utilizzo di SIGLA](https://consiglionazionaledellericerche.github.io/sigla-main/nuovo_layout.html).             

# Startup with Docker on H2
```shell script
git clone git@github.com:consiglionazionaledellericerche/sigla-ng.git
cd sigla-ng
docker run -d --name sigla-h2 -e H2_OPTIONS='-ifNotExists' -ti oscarfonts/h2
docker run -d --name sigla-thorntail --link sigla-h2:db -e THORNTAIL_PROJECT_STAGE="demo-h2" -e THORNTAIL_DATASOURCES_DATA-SOURCES_SIGLA_CONNECTION-URL="jdbc:h2:tcp://db:1521/db-sigla" -ti consiglionazionalericerche/sigla-main:release
docker run -d --name sigla-ng --link sigla-h2:db -e SPRING_PROFILES_ACTIVE=demo -e SPRING_DATASOURCE_URL="jdbc:h2:tcp://db:1521/db-sigla" -ti consiglionazionalericerche/sigla-ng:latest
docker run -d --name sigla-nginx -p 80:80 --link sigla-thorntail:sigla-thorntail --link sigla-ng:sigla-ng -v $(pwd)/conf.d/:/etc/nginx/conf.d/:ro -ti nginx
```
_Collegarsi a http://localhost/ username: ENTE password da impostare al primo login._

# Startup with Docker on Postgresql
```shell script
git clone git@github.com:consiglionazionaledellericerche/sigla-ng.git
cd sigla-ng
docker run --name sigla-postgres -v $PWD/init-user-postgres-db.sh:/docker-entrypoint-initdb.d/init-user-db.sh -e POSTGRES_PASSWORD=mysecretpassword -d postgres:9.6
docker run -d --name sigla-thorntail --link sigla-postgres:db -e THORNTAIL_PROJECT_STAGE="demo-postgres" -e THORNTAIL_DATASOURCES_DATA-SOURCES_SIGLA_CONNECTION-URL="jdbc:postgresql://db:5432/sigladb?schema=public" -ti consiglionazionalericerche/sigla-main:release
docker run -d --name sigla-ng --link sigla-postgres:db -e SPRING_PROFILES_ACTIVE=demopostgresql -e SPRING_DATASOURCE_URL="jdbc:postgresql://db:5432/sigladb?schema=public" -ti consiglionazionalericerche/sigla-ng:latest
docker run -d --name sigla-nginx -p 80:80 --link sigla-thorntail:sigla-thorntail --link sigla-ng:sigla-ng -v $(pwd)/conf.d/:/etc/nginx/conf.d/:ro -ti nginx
```
_Collegarsi a http://localhost/ username: ENTE password da impostare al primo login._
 
# Compile & Startup with Docker
```shell script
git clone git@github.com:consiglionazionaledellericerche/sigla-ng.git
cd sigla-ng
docker run -d --name sigla-h2 -e H2_OPTIONS='-ifNotExists' -ti oscarfonts/h2
docker run -d --name sigla-thorntail --link sigla-h2:db -e THORNTAIL_PROJECT_STAGE="demo-h2" -e THORNTAIL_DATASOURCES_DATA-SOURCES_SIGLA_CONNECTION-URL="jdbc:h2:tcp://db:1521/db-sigla" -ti consiglionazionalericerche/sigla-main:release
mvn clean install -DskipTests -Pprod
docker build -t sigla-ng .
docker run -d --name sigla-ng --link sigla-h2:db -e SPRING_PROFILES_ACTIVE=demo -e SPRING_DATASOURCE_URL="jdbc:h2:tcp://db:1521/db-sigla" -ti sigla-ng
docker run -d --name sigla-nginx -p 80:80 --link sigla-thorntail:sigla-thorntail --link sigla-ng:sigla-ng -v $(pwd)/conf.d/:/etc/nginx/conf.d/:ro -ti nginx
```
_Collegarsi a http://localhost/ username: ENTE password da impostare al primo login._
