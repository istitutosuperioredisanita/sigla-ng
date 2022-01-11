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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import it.cnr.rsi.domain.Utente;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

public class UserContext implements UserDetails {
    private static final long serialVersionUID = 1L;
    public static final GrantedAuthority ROLE_USER = new SimpleGrantedAuthority("ROLE_USER");
    public static final GrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");
    public static final GrantedAuthority ROLE_ADMIN = new SimpleGrantedAuthority("ROLE_ADMIN");
    public static final int MONTH_EXPIRED = 6;

    @JsonIgnore
    private Utente currentUser;

    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private Boolean ldap;

    private Collection<GrantedAuthority> authorities;
    private String login;
    private Integer esercizio;
    private String cds;
    private String uo;
    private String cdr;

    private Map<String, List<GrantedAuthority>> roles;
    private List<UserContext> users;
    private Boolean utenteMultiplo;

    public UserContext(Utente currentUser) {
        super();
        this.roles = new HashMap<String, List<GrantedAuthority>>();
        this.roles.put("U", Arrays.asList(ROLE_USER));
        this.roles.put("A", Arrays.asList(ROLE_USER, ROLE_SUPERUSER));
        this.roles.put("S", Arrays.asList(ROLE_USER, ROLE_ADMIN));

        this.currentUser = currentUser;
        this.username = currentUser.getCdUtente();
        this.utenteMultiplo = Boolean.FALSE;
        this.authorities = Optional.ofNullable(currentUser)
            .map(Utente::getTiUtente)
            .map(s -> roles.get(s))
            .orElse(Arrays.asList(ROLE_USER));
    }


    public void setAuthorities(Collection<GrantedAuthority> authorities) {
        this.authorities = authorities;
    }

    @Override
    @JsonIgnore
    public Collection<GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @JsonProperty("authorities")
    public Collection<String> getAuthoritiesHipster() {
        return getAuthorities()
            .stream()
            .map(x -> x.getAuthority())
            .collect(Collectors.toList());
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return currentUser.getPassword();
    }

    @Override
    public String getUsername() {
        return username;
    }

    public UserContext changeUsernameAndAuthority(String username) {
        this.username = username;
        this.setAuthorities(
            this.users.stream()
                .filter(userContext -> userContext.getUsername().equals(username))
                .findAny()
                .map(userContext -> userContext.getAuthorities())
                .get()
        );
        this.utenteMultiplo = Boolean.TRUE;
        return this;
    }

    @Override
    public boolean isAccountNonExpired() {
        return Optional.ofNullable(this.currentUser)
            .filter(utente -> !utente.getFlAutenticazioneLdap())
            .flatMap(utente -> Optional.ofNullable(utente.getDtUltimaVarPassword()))
            .filter(java.sql.Date.class::isInstance)
            .map(java.sql.Date.class::cast)
            .map(Date::toLocalDate)
            .map(localDate -> localDate.plusMonths(MONTH_EXPIRED))
            .map(localDate -> localDate.isAfter(LocalDate.now(ZoneId.systemDefault())))
            .orElse(Boolean.TRUE);
    }

    @Override
    public boolean isAccountNonLocked() {
        final Optional<Utente> user = Optional.ofNullable(currentUser);
        return user
            .flatMap(utente -> Optional.ofNullable(utente.getDtUltimaVarPassword()))
            .isPresent() || user.filter(Utente::getFlAutenticazioneLdap).isPresent();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return !Optional.ofNullable(currentUser)
            .flatMap(utente -> Optional.ofNullable(utente.getDtUltimoAccesso()))
            .filter(Date.class::isInstance)
            .map(Date.class::cast)
            .map(Date::toLocalDate)
            .map(localDate -> localDate.plusMonths(UserContext.MONTH_EXPIRED))
            .map(localDate -> localDate.isBefore(LocalDate.now(ZoneId.systemDefault())))
            .orElse(Boolean.FALSE);
    }

    @Override
    public boolean isEnabled() {
        return !Optional.ofNullable(currentUser)
            .flatMap(utente -> Optional.ofNullable(utente.getDtFineValidita()))
            .filter(Date.class::isInstance)
            .map(Date.class::cast)
            .map(Date::toLocalDate)
            .map(localDate -> localDate.isBefore(LocalDate.now(ZoneId.systemDefault())))
            .orElse(Boolean.FALSE);
    }

    public Long getId() {
        return 0L;
    }

    public String getLogin() {
        return Optional.ofNullable(login)
            .orElseGet(() -> currentUser.getCdUtente());
    }

    public String getFirstName() {
        return Optional.ofNullable(firstName)
            .orElseGet(() -> currentUser.getNome());
    }

    public String getLastName() {
        return Optional.ofNullable(lastName)
            .orElseGet(() -> currentUser.getCognome());
    }

    public String getEmail() {
        return Optional.ofNullable(email)
            .orElse("");
    }

    public String getLangKey() {
        return Locale.ITALIAN.getLanguage();
    }

    public Integer getEsercizio() {
        return Optional.ofNullable(esercizio)
            .orElse(null);
    }
    public String getCds() {
        return Optional.ofNullable(cds)
            .orElse(null);
    }
    public String getUo() {
        return Optional.ofNullable(uo)
            .orElse(null);
    }
    public String getCdr() {
        return Optional.ofNullable(cdr)
            .orElse(null);
    }

    public boolean isLdap() {
        return Optional.ofNullable(ldap)
            .orElse(Boolean.FALSE);
    }

    public UserContext setUsername(String username) {
        this.username = username;
        return this;
    }

    public UserContext setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public UserContext setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public UserContext setEmail(String email) {
        this.email = email;
        return this;
    }

    public UserContext setLdap(Boolean ldap) {
        this.ldap = ldap;
        return this;
    }

    public UserContext setLogin(String login) {
        this.login = login;
        return this;
    }

    public UserContext setEsercizio(Integer esercizio) {
        this.esercizio = esercizio;
        return this;
    }

    public UserContext setCds(String cds) {
        this.cds = cds;
        return this;
    }

    public UserContext setUo(String uo) {
        this.uo = uo;
        return this;
    }

    public UserContext setCdr(String cdr) {
        this.cdr = cdr;
        return this;
    }

    public List<UserContext> getUsers() {
        return users;
    }

    public void setUsers(List<UserContext> users) {
        this.users = users;
    }

    public UserContext users(List<UserContext> users) {
        this.users = users;
        return this;
    }

    public String getDsUtente() {
        return Optional.ofNullable(currentUser)
            .map(Utente::getDsUtente)
            .orElse(null);
    }

    public Utente getCurrentUser() {
        return currentUser;
    }

    public Boolean getUtenteMultiplo() {
        return utenteMultiplo;
    }

    public void setUtenteMultiplo(Boolean utenteMultiplo) {
        this.utenteMultiplo = utenteMultiplo;
    }
}
