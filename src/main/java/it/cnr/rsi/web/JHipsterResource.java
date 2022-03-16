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

package it.cnr.rsi.web;

import it.cnr.rsi.domain.Utente;
import it.cnr.rsi.security.ContextAuthentication;
import it.cnr.rsi.security.UserContext;
import it.cnr.rsi.service.UtenteService;
import it.cnr.rsi.web.rest.errors.InvalidPasswordException;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.OidcKeycloakAccount;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.IDToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by francesco on 21/03/17.
 */

@RestController
@RequestMapping("/api")
public class JHipsterResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(JHipsterResource.class);

    @Autowired
    private Environment env;
    @Autowired
    private UtenteService utenteService;

    @GetMapping("/profile-info")
    public ResponseEntity<Map<String, Object>> profileInfo(HttpServletRequest request) {
        List<String> profiles = Arrays.asList(env.getActiveProfiles());
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("activeProfiles", profiles);
        map.put("instituteAcronym", env.getProperty("institute.acronym", "CNR"));
        map.put("urlChangePassword", env.getProperty("security.ldap.change.password.url"));
        map.put("siglaWildflyURL", env.getProperty("sigla.wildfly.url", ""));
        map.put("keycloakEnabled", Boolean.valueOf(env.getProperty("keycloak.enabled", "false")));
        map.put("ssoAppsMenuDisplay", Boolean.valueOf(env.getProperty("sso.apps.menu.display", "false")));

        profiles
            .stream()
            .filter(profile -> profile.equalsIgnoreCase("dev"))
            .findAny()
            .ifPresent(profile -> map.put("ribbonEnv", profile));

        return ResponseEntity.ok(map);
    }

    @RequestMapping(value = "/validate-authentication",
        method = {RequestMethod.GET,
            RequestMethod.POST,
            RequestMethod.DELETE,
            RequestMethod.PUT})
    public ResponseEntity<Boolean> login() {
        LOGGER.info("validate login");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        LOGGER.info("validate login with authentication {}", authentication);
        if (!Optional
            .ofNullable(authentication)
            .map(auth -> auth.getPrincipal())
            .filter(principal -> principal instanceof UserContext)
            .map(o -> true)
            .orElse(false)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }
        return ResponseEntity.ok(true);
    }

    @GetMapping("/token")
    public ResponseEntity<?> token() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        final Optional<KeycloakAuthenticationToken> keycloakAuthenticationToken = Optional.ofNullable(authentication)
            .filter(KeycloakAuthenticationToken.class::isInstance)
            .map(KeycloakAuthenticationToken.class::cast);
        if (keycloakAuthenticationToken.isPresent() && keycloakAuthenticationToken.get().isAuthenticated()) {
            final OidcKeycloakAccount account = keycloakAuthenticationToken.get().getAccount();
            final Principal principal = account.getPrincipal();
            if (principal instanceof KeycloakPrincipal) {
                KeycloakPrincipal kPrincipal = (KeycloakPrincipal) principal;
                return ResponseEntity.ok(
                    Stream.of(
                        new AbstractMap.SimpleEntry<>("access_token", kPrincipal.getKeycloakSecurityContext().getTokenString()),
                        new AbstractMap.SimpleEntry<>("exp", kPrincipal.getKeycloakSecurityContext().getIdToken().getExp())
                    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))
                );
            }
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/account")
    public ResponseEntity<?> account() {
        LOGGER.info("get account");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        LOGGER.info("get account with authentication {}", authentication);
        final Optional<KeycloakAuthenticationToken> keycloakAuthenticationToken = Optional.ofNullable(authentication)
            .filter(KeycloakAuthenticationToken.class::isInstance)
            .map(KeycloakAuthenticationToken.class::cast);
        Optional<UserContext> userContext = Optional.empty();
        if (keycloakAuthenticationToken.isPresent() && keycloakAuthenticationToken.get().isAuthenticated() &&
            Optional.ofNullable(keycloakAuthenticationToken.get().getAccount()).isPresent()) {
            final OidcKeycloakAccount account = keycloakAuthenticationToken.get().getAccount();
            LOGGER.info("get account with authentication {}", account);
            final Principal principal = account.getPrincipal();
            if (principal instanceof KeycloakPrincipal) {
                KeycloakPrincipal kPrincipal = (KeycloakPrincipal) principal;
                IDToken token = kPrincipal.getKeycloakSecurityContext().getIdToken();
                final Optional<Utente> optionalUtente = utenteService.findUsersForUid(token.getPreferredUsername())
                    .stream()
                    .sorted(Comparator.comparing(Utente::getDtUltimoAccesso).reversed())
                    .findFirst();
                if (optionalUtente.isPresent()) {
                    /**
                     * Controllo la data di ultimo accesso che non sia superiore a 6 mesi
                     */
                    if (optionalUtente.flatMap(utente -> Optional.ofNullable(utente.getDtUltimoAccesso()))
                        .filter(Date.class::isInstance)
                        .map(Date.class::cast)
                        .map(Date::toLocalDate)
                        .map(localDate -> localDate.plusMonths(UserContext.MONTH_EXPIRED))
                        .map(localDate -> localDate.isBefore(LocalDate.now(ZoneId.systemDefault())))
                        .orElse(Boolean.FALSE)) {
                        token.setUpdatedAt(optionalUtente.get().getDtUltimoAccesso().getTime());
                        return ResponseEntity.unprocessableEntity().body(token);
                    }
                    userContext = Optional.of(new UserContext(optionalUtente.get()));
                    userContext.get().setFirstName(token.getGivenName().toUpperCase(Locale.ITALIAN));
                    userContext.get().setLastName(token.getFamilyName().toUpperCase(Locale.ITALIAN));
                    userContext.get().setLogin(token.getPreferredUsername());
                } else {
                    return ResponseEntity.unprocessableEntity().body(token);
                }
            }
        } else {
            userContext = Optional
                .ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(UserContext.class::isInstance)
                .map(UserContext.class::cast);
        }
        return ResponseEntity.ok(
            userContext
                .map(s -> {
                    final Optional<List<Utente>> usersForUid = Optional.ofNullable(
                        utenteService.findUsersForUid(s.getLogin())).filter(utentes -> !utentes.isEmpty());
                    if (usersForUid.isPresent()) {
                        s.users(usersForUid.get()
                            .stream()
                            .map(utente -> new UserContext(utente))
                            .collect(Collectors.toList()));
                    } else {
                        s.users(Collections.singletonList(utenteService.loadUserByUsername(s.getLogin())));
                    }
                    SecurityContextHolder.getContext().setAuthentication(new ContextAuthentication(s, keycloakAuthenticationToken.orElse(null)));
                    return s;
                })
                .orElse(null)
        );
    }

    @GetMapping("/account/{username}")
    public ResponseEntity<UserDetails> account(@PathVariable String username) {
        LOGGER.info("get account: {}", username);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(
            Optional
                .ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof UserContext)
                .map(UserContext.class::cast)
                .map(userContext -> {
                    final UserContext newUserContext = userContext.changeUsernameAndAuthority(username);
                    SecurityContextHolder.getContext().setAuthentication(
                        new ContextAuthentication(
                            newUserContext,
                            Optional.ofNullable(SecurityContextHolder.getContext())
                                .map(SecurityContext::getAuthentication)
                                .filter(ContextAuthentication.class::isInstance)
                                .map(ContextAuthentication.class::cast)
                                .map(ContextAuthentication::getKeycloakAuthenticationToken)
                                .orElse(null)
                        )
                    );
                    return newUserContext;
                })
                .orElseThrow(() -> new RuntimeException("something went wrong " + authentication.toString())));
    }

    /**
     * POST  /account/change-password : changes the current user's password
     *
     * @param password the new password
     */
    @PostMapping(path = "/account/change-password")
    public ResponseEntity<Boolean> changePassword(@RequestBody String password) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        final String newPassword = Optional.ofNullable(password)
            .filter(s -> s.length() > 4)
            .filter(s -> s.length() < 50)
            .orElseThrow(() -> new InvalidPasswordException(password));

        final String userId = Optional
            .ofNullable(authentication)
            .map(Authentication::getPrincipal)
            .filter(principal -> principal instanceof UserContext)
            .map(UserContext.class::cast)
            .map(userContext -> userContext.getLogin())
            .orElseThrow(() -> new RuntimeException("something went wrong " + authentication.toString()));
        LOGGER.info("change password for user: {}", userId);
        utenteService.changePassword(userId, password);
        return ResponseEntity.ok(true);
    }
}
