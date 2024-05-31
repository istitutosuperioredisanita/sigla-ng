(function(window) {
    window.env = window.env || {};
  
    // Environment variables
    window['env']['baseUrl'] = '${BASE_URL}';
    window['env']['applicationContextUrl'] = '${BASE_URL}${APPLICATION_CONTEXT}';
    window['env']['apiUrl'] = '${BASE_URL}${APPLICATION_CONTEXT}${API_CONTEXT}';

    window['env']['urlChangePassword'] = '${URL_CHANGE_PASSWORD}';
    window['env']['instituteAcronym'] = '${INSTITUTE_ACRONYM}';
    window['env']['ssoAppsMenuDisplay'] = '${SSO_APPS_MENU_DISPLAY}';
    window['env']['ribbon'] = '${RIBBON}';

    window['env']['oidc.enable'] = '${OIDC_ENABLE}';
    window['env']['oidc.authority'] = '${OIDC_AUTHORITY}';
    window['env']['oidc.redirectUrl'] = '${OIDC_REDIRECTURL}';
    window['env']['oidc.clientId'] = '${OIDC_CLIENTID}';
    window['env']['oidc.postLogoutRedirectUri'] = '${OIDC_POSTLOGOUTREDIRECTURL}';
})(this);