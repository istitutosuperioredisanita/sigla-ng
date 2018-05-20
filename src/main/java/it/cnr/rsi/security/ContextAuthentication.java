package it.cnr.rsi.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class ContextAuthentication implements Authentication {
    final UserContext userContext;

    public ContextAuthentication(UserContext userContext) {
        this.userContext = userContext;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
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
    public String getName() {
        return userContext.getUsername();
    }
}
