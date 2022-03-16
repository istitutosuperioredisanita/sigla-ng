package it.cnr.rsi.config;

import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationSuccessHandler;
import org.keycloak.adapters.springsecurity.authentication.KeycloakCookieBasedRedirect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.util.UriUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.Charset;

public class CustomKeyCloakAuthSuccessHandler extends KeycloakAuthenticationSuccessHandler {

    private final AuthenticationSuccessHandler fallback;
    private static final Logger LOG = LoggerFactory.getLogger(CustomKeyCloakAuthSuccessHandler.class);

    public CustomKeyCloakAuthSuccessHandler(AuthenticationSuccessHandler fallback) {
        super(fallback);
        this.fallback = fallback;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String location = KeycloakCookieBasedRedirect.getRedirectUrlFromCookie(request);
        if (location == null) {
            if (fallback != null) {
                fallback.onAuthenticationSuccess(request, response, authentication);
            }
        } else {
            try {
                location = UriUtils.decode(location, Charset.defaultCharset());
                response.addCookie(KeycloakCookieBasedRedirect.createCookieFromRedirectUrl(null));
                response.sendRedirect(location);
            } catch (IOException e) {
                LOG.warn("Unable to redirect user after login", e);
            }
        }
    }
}
