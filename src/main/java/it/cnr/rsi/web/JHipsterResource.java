package it.cnr.rsi.web;

import it.cnr.rsi.security.UserContext;
import it.cnr.rsi.service.UtenteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by francesco on 21/03/17.
 */

@RestController
@RequestMapping("/api")
public class JHipsterResource {

    private static final Logger LOGGER  = LoggerFactory.getLogger(JHipsterResource.class);

    @Autowired
    private Environment env;
    @Autowired
    private UtenteService utenteService;

    @GetMapping("/profile-info")
    public ResponseEntity<Map<String, Object>> profileInfo() {
        List<String> profiles = Arrays.asList(env.getActiveProfiles());
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("activeProfiles", profiles);
        map.put("instituteAcronym", env.getProperty("institute.acronym", "CNR"));

        profiles
            .stream()
            .filter(profile -> profile.equalsIgnoreCase("dev"))
            .findAny()
            .ifPresent(profile -> map.put("ribbonEnv", profile));

        return ResponseEntity.ok(map);
    }

    @GetMapping("/account")
    public ResponseEntity<UserDetails> account() {
    	LOGGER.info("get account");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(
            Optional
                .ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof UserContext)
                .map(UserContext.class::cast)
                .map(userContext -> {
                    return userContext.users(utenteService.findUsersForUid(userContext.getLogin()).stream()
                        .map(utente -> new UserContext(utente))
                        .collect(Collectors.toList()));
                })
                .orElseThrow(() -> new RuntimeException("something went wrong " + authentication.toString()))
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
            .map(userContext -> userContext.changeUsernameAndAuthority(username))
            .orElseThrow(() -> new RuntimeException("something went wrong " + authentication.toString())));
    }
}
