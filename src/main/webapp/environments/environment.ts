export const environment = {
  production: false,
  baseUrl: window['env']['baseUrl'] || 'default',
  applicationContextUrl: window['env']['applicationContextUrl'] || 'default',
  apiUrl: window['env']['apiUrl'] || 'default',
  debug: window['env']['debug'] || false,
  urlChangePassword: window['env']['urlChangePassword'],
  instituteAcronym: window['env']['instituteAcronym'],
  ssoAppsMenuDisplay: window['env']['ssoAppsMenuDisplay'] || 'false',
  ribbon: window['env']['ribbon'],
  oidc: {
    enable: window['env']['oidc.enable'] || 'false',
    authority: window['env']['oidc.authority'],
    redirectUrl: window['env']['oidc.redirectUrl'],
    clientId: window['env']['oidc.clientId'],
    postLogoutRedirectUri: window['env']['oidc.postLogoutRedirectUri'] || window.location.origin
  }
};
