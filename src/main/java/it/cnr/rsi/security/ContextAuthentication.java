/*
 * Copyright (C) 2019  Consiglio Nazionale delle Ricerche
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package it.cnr.rsi.security;

import org.keycloak.adapters.OidcKeycloakAccount;
import org.keycloak.adapters.springsecurity.account.SimpleKeycloakAccount;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.adapters.tomcat.SimplePrincipal;
import org.springframework.data.annotation.Transient;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Optional;

public class ContextAuthentication extends KeycloakAuthenticationToken implements Authentication {
    final UserContext userContext;
    final KeycloakAuthenticationToken keycloakAuthenticationToken;

    public ContextAuthentication(UserContext userContext, KeycloakAuthenticationToken keycloakAuthenticationToken) {
        super(
            Optional.ofNullable(keycloakAuthenticationToken)
                .flatMap(k -> Optional.ofNullable(k.getAccount()))
                .orElseGet(() -> new SimpleKeycloakAccount(new SimplePrincipal(""), null, null)),
            Optional.ofNullable(keycloakAuthenticationToken)
                .flatMap(k -> Optional.ofNullable(k.isInteractive()))
                .orElse(Boolean.FALSE)
        );
        this.userContext = userContext;
        this.keycloakAuthenticationToken = keycloakAuthenticationToken;
    }

    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        return userContext.getAuthorities();
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getDetails() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return userContext;
    }

    @Override
    public boolean isAuthenticated() {
        return true;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {

    }

    @Override
    public OidcKeycloakAccount getAccount() {
        return Optional.ofNullable(keycloakAuthenticationToken)
            .map(KeycloakAuthenticationToken::getAccount)
            .orElse(null);
    }

    @Override
    public String getName() {
        return userContext.getUsername();
    }

    public KeycloakAuthenticationToken getKeycloakAuthenticationToken() {
        return keycloakAuthenticationToken;
    }
}
