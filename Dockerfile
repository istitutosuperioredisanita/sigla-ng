### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:16-alpine as builder
MAINTAINER Marco Spasiano <marco.spasiano@cnr.it>

COPY package.json package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i --legacy-peer-deps && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN npm run webpack:build


### STAGE 2: Setup ###

FROM nginx:alpine

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/target/www /usr/share/nginx/html

ENV BASE_URL=http://localhost:8080
ENV APPLICATION_CONTEXT=/SIGLA
ENV API_CONTEXT=/restapi
ENV URL_CHANGE_PASSWORD=https://utenti.cnr.it/utenti/app/action/pub/pass/password
ENV SSO_APPS_MENU_DISPLAY=false
ENV INSTITUTE_ACRONYM=CNR
ENV OIDC_ENABLE=false
ENV OIDC_AUTHORITY=http://dockerwebtest02.si.cnr.it:8110/auth/realms/cnr/.well-known/openid-configuration
ENV OIDC_CLIENTID=angular-public
ENV OIDC_REDIRECTURL=http://localhost:9000
ENV OIDC_POSTLOGOUTREDIRECTURL=https://apps.cnr.it


# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js && exec nginx -g 'daemon off;'"]