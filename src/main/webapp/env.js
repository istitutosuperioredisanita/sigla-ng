(function(window) {
    window['env'] = window['env'] || {};
  
    // Environment variables
    window['env']['baseUrl'] = 'http://localhost:8080';
    window['env']['applicationContextUrl'] = 'http://localhost:8080/SIGLA';
    window['env']['apiUrl'] = 'http://localhost:8080/SIGLA/restapi';
    window['env']['urlChangePassword'] = 'https://utenti.cnr.it/utenti/app/action/pub/home';
    window['env']['production'] = false;
    window['env']['instituteAcronym'] = 'CNR';
    window['env']['ssoAppsMenuDisplay'] = 'true';

    window['env']['oidc.enable'] = 'true';
    window['env']['oidc.authority'] = 'http://dockerwebtest02.si.cnr.it:8110/auth/realms/cnr/.well-known/openid-configuration';
    window['env']['oidc.redirectUrl'] = 'http://localhost:9000';
    window['env']['oidc.clientId'] = 'angular-public';
    window['env']['oidc.postLogoutRedirectUri'] = 'https://apps.cnr.it';
  })(this);