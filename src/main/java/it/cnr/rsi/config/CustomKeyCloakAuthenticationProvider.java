package it.cnr.rsi.config;

import org.keycloak.adapters.OidcKeycloakAccount;
import org.keycloak.adapters.springsecurity.account.KeycloakRole;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;

import java.util.*;
import java.util.stream.Stream;

public class CustomKeyCloakAuthenticationProvider extends KeycloakAuthenticationProvider {
    public static final String CONTEXTS = "contexts";
    public static final String ROLES = "roles";
    @Autowired
    private SSOConfigurationProperties properties;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        KeycloakAuthenticationToken token = (KeycloakAuthenticationToken) authentication;
        List<GrantedAuthority> grantedAuthorities = new ArrayList<GrantedAuthority>();
        for (String role : token.getAccount().getRoles()) {
            grantedAuthorities.add(new KeycloakRole(role));
        }

        return new KeycloakAuthenticationToken(token.getAccount(), token.isInteractive(), mapAuthorities(token.getAccount(), grantedAuthorities));
    }

    public boolean isCNRUser(OidcKeycloakAccount account) {
        return account.
            getKeycloakSecurityContext()
            .getIdToken()
            .getOtherClaims()
            .entrySet()
            .stream()
            .filter(stringObjectEntry -> stringObjectEntry.getKey().equalsIgnoreCase(properties.getUser()))
            .findAny()
            .map(stringObjectEntry -> stringObjectEntry.getValue())
            .filter(Boolean.class::isInstance)
            .map(Boolean.class::cast)
            .orElse(Boolean.FALSE);
    }

    public String getMatricola(OidcKeycloakAccount account) {
        return account.
            getKeycloakSecurityContext()
            .getIdToken()
            .getOtherClaims()
            .entrySet()
            .stream()
            .filter(stringObjectEntry -> stringObjectEntry.getKey().equalsIgnoreCase(properties.getMatricola()))
            .findAny()
            .map(stringObjectEntry -> stringObjectEntry.getValue())
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .orElse(null);
    }

    public String getUsernameCNR(OidcKeycloakAccount account) {
        return account.
            getKeycloakSecurityContext()
            .getIdToken()
            .getOtherClaims()
            .entrySet()
            .stream()
            .filter(stringObjectEntry -> stringObjectEntry.getKey().equalsIgnoreCase(properties.getUsername_cnr()))
            .findAny()
            .map(stringObjectEntry -> stringObjectEntry.getValue())
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .orElse(null);
    }

    public String getLivello(OidcKeycloakAccount account) {
        return account.
            getKeycloakSecurityContext()
            .getIdToken()
            .getOtherClaims()
            .entrySet()
            .stream()
            .filter(stringObjectEntry -> stringObjectEntry.getKey().equalsIgnoreCase(properties.getLivello()))
            .findAny()
            .map(stringObjectEntry -> stringObjectEntry.getValue())
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .orElse(null);
    }

    public Collection<? extends GrantedAuthority> mapAuthorities(OidcKeycloakAccount account, List<GrantedAuthority> grantedAuthorities) {
        if (isCNRUser(account)) {
            grantedAuthorities.add(new KeycloakRole("USER"));
        }
        final Optional<Map.Entry<String, Object>> contexts = account.
            getKeycloakSecurityContext()
            .getIdToken()
            .getOtherClaims()
            .entrySet()
            .stream()
            .filter(stringObjectEntry -> stringObjectEntry.getKey().equalsIgnoreCase(CONTEXTS))
            .findAny();
        if (contexts.isPresent()) {
            final Stream<Map.Entry> stream = contexts
                .map(stringObjectEntry -> stringObjectEntry.getValue())
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(map -> map.entrySet())
                .get()
                .stream()
                .filter(Map.Entry.class::isInstance)
                .map(Map.Entry.class::cast);
            final Optional<Map.Entry> any1 = stream
                .filter(entry -> entry.getKey().equals(properties.getContesto()))
                .findAny();
            if (any1.isPresent()) {
                final Optional<Map<String, List<String>>> mapRoles =
                    Optional.ofNullable(any1.get().getValue())
                        .filter(Map.class::isInstance)
                        .map(Map.class::cast);
                if (mapRoles.isPresent()) {
                    final Optional<List<String>> roles = mapRoles
                        .get()
                        .entrySet()
                        .stream()
                        .filter(stringEntry -> stringEntry.getKey().equalsIgnoreCase(ROLES))
                        .map(Map.Entry::getValue)
                        .findAny();
                    if (roles.isPresent()) {
                        roles.get().stream().forEach(s -> {
                            grantedAuthorities.add(new KeycloakRole(s));
                        });
                    }
                }
            }
        }
        return grantedAuthorities;
    }
}
